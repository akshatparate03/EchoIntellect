// Stores the login session (JWT + basic user info) in the browser.
// The real account data (email, password hash, chats) lives in PostgreSQL on the backend.

const KEY_TOKEN = "ei:token";
const KEY_USER = "ei:user";

export type SessionUser = { email: string; name: string };

// Old versions kept fake accounts / usage in localStorage - clean them up once.
["ei:users", "ei:current", "ei:usage"].forEach((k) => {
  try {
    localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
});

function tokenExpired(token: string): boolean {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(part));
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function getToken(): string | null {
  const token = localStorage.getItem(KEY_TOKEN);
  if (!token) return null;
  if (tokenExpired(token)) {
    clearSession();
    return null;
  }
  return token;
}

export function getUser(): SessionUser | null {
  if (!getToken()) return null;
  try {
    const raw = localStorage.getItem(KEY_USER);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: SessionUser) {
  localStorage.setItem(KEY_TOKEN, token);
  localStorage.setItem(KEY_USER, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER);
}
