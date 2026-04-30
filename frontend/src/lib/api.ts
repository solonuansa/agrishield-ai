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

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    return data.detail || data.message || `Request gagal (${response.status})`;
  } catch {
    return `Request gagal (${response.status})`;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

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

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  return request<T>(path, {
    method: "GET",
    headers: {
      ...getAuthHeaders(token),
    },
  });
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string | null
): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      ...getAuthHeaders(token),
    },
  });
}

export async function apiPostForm<T>(
  path: string,
  formData: FormData,
  token?: string | null
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers: {
      ...getAuthHeaders(token),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  const payload = (await response.json()) as ApiSuccess<T>;
  return payload.data;
}

