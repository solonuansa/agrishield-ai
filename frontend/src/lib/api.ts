import { clearSession, getAccessToken, readSession } from "@/lib/auth";

export type ApiSuccess<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown> | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:8000/api";

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function processRefreshQueue(token: string | null) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const session = readSession();
  if (!session?.refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });

    if (!response.ok) {
      clearSession();
      return null;
    }

    const payload = (await response.json()) as ApiSuccess<{
      access_token: string;
      refresh_token?: string;
    }>;

    const newToken = payload.data.access_token;
    const newRefreshToken = payload.data.refresh_token || session.refreshToken;

    // Update session in localStorage
    if (typeof window !== "undefined") {
      const updated = { ...session, token: newToken, refreshToken: newRefreshToken };
      window.localStorage.setItem("agrishield.session", JSON.stringify(updated));
      window.localStorage.setItem("token", newToken);
    }

    return newToken;
  } catch {
    clearSession();
    return null;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return data.detail || data.message || `Request gagal (${response.status})`;
  } catch {
    return `Request gagal (${response.status})`;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  retry = true,
  cache: RequestCache = "no-store"
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache,
  });

  if (response.status === 401 && retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (newToken) {
            resolve(request<T>(path, stripSignal(init), false));
          } else {
            reject(new ApiError("Sesi telah berakhir. Silakan masuk kembali.", 401));
          }
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;
    await processRefreshQueue(newToken);

    if (newToken) {
      return request<T>(path, stripSignal(init), false);
    }

    throw new ApiError("Sesi telah berakhir. Silakan masuk kembali.", 401);
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  const payload = (await response.json()) as ApiSuccess<T>;
  return payload.data;
}

export function getApiBaseUrl() {
  return API_BASE;
}

export function getAuthHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(
  path: string,
  token?: string | null,
  cache: RequestCache = "no-store",
  timeout?: number
): Promise<T> {
  const { signal } = createTimeoutSignal(timeout);
  return request<T>(
    path,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(token),
      },
      signal,
    },
    true,
    cache
  );
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string | null,
  timeout?: number
): Promise<T> {
  const { signal } = createTimeoutSignal(timeout);
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      ...getAuthHeaders(token),
    },
    signal,
  });
}

export async function apiPostForm<T>(
  path: string,
  formData: FormData,
  token?: string | null,
  timeout?: number
): Promise<T> {
  const { signal } = createTimeoutSignal(timeout);
  return request<T>(path, {
    method: "POST",
    body: formData,
    headers: {
      ...getAuthHeaders(token),
    },
    signal,
  });
}

function createTimeoutSignal(timeout?: number): { signal?: AbortSignal } {
  if (!timeout) return {};
  const controller = new AbortController();
  setTimeout(() => controller.abort(new Error(`Request timeout after ${timeout}ms`)), timeout);
  return { signal: controller.signal };
}

function stripSignal(init?: RequestInit): RequestInit | undefined {
  if (!init) return init;
  const { signal: _signal, ...rest } = init;
  return rest;
}
