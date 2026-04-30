export type StoredUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
};

export type StoredSession = {
  token: string;
  refreshToken: string;
  user: StoredUser;
};

const SESSION_KEY = "agrishield.session";

export function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function writeSession(session: StoredSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem("token", session.token);
  window.localStorage.setItem("role", session.user.role);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("role");
}

export function getAccessToken(): string | null {
  return readSession()?.token || null;
}

