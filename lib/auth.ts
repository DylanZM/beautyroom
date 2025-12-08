// /lib/auth.ts
export const AUTH_KEY = "beautyroom_auth";

export type AuthPayload = {
  token?: string | null;
  user?: any | null;
  raw?: any;
};

export function extractAuthFromPayload(payload: any): AuthPayload {
  const token =
    payload?.token ||
    payload?.access_token ||
    payload?.accessToken ||
    payload?.data?.token ||
    payload?.token?.plainTextToken ||
    null;

  const user = payload?.user || payload?.data?.user || payload?.data || null;

  return { token, user, raw: payload };
}

export function saveAuthToStorage(auth: AuthPayload) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch {
    // ignore
  }
}

export function loadAuthFromStorage(): AuthPayload | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuthFromStorage() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
}