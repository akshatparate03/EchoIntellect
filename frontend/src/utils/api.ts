import { clearSession, getToken } from "./session";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "https://echointellect-backend.onrender.com"
).replace(/\/$/, "");

export type ModelKey = "gpt" | "gemini" | "perplexity" | "deepseek";

// ----------------------
// Types
// ----------------------
export type AuthResponse = {
  token: string;
  user: { email: string; name: string };
  message?: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
  models: ModelKey[];
  created_at: string;
  updated_at: string;
};

export type TurnResponse = { content: string; is_error: boolean };

export type Turn = {
  turn: number;
  prompt: string;
  /** null = prompt was sent to every model of the chat, otherwise only to that model */
  target: ModelKey | null;
  created_at: string;
  responses: Partial<Record<ModelKey, TurnResponse>>;
};

export type ConversationDetail = ConversationSummary & { turns: Turn[] };

export type SharedChat = {
  id: string;
  model: ModelKey;
  items: { prompt: string; response: string }[];
  createdAt: string;
};

// ----------------------
// Core request helper
// ----------------------
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = auth ? getToken() : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Please try again in a moment.", 0);
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    // Session expired / invalid while logged in -> go to login
    if (res.status === 401 && token) {
      clearSession();
      if (window.location.pathname !== "/login") {
        window.location.assign(
          `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`
        );
      }
    }
    const detail =
      typeof data?.detail === "string" ? data.detail : "Something went wrong. Please try again.";
    throw new ApiError(detail, res.status);
  }

  return data as T;
}

// ----------------------
// Auth
// ----------------------
export const apiCheckEmail = (email: string) =>
  request<{ exists: boolean }>("/api/auth/check-email", {
    method: "POST",
    body: { email },
    auth: false,
  });

export const apiSendOtp = (name: string, email: string) =>
  request<{ ok: boolean }>("/api/auth/send-otp", {
    method: "POST",
    body: { name, email },
    auth: false,
  });

export const apiVerifyOtp = (email: string, otp: string) =>
  request<{ signup_token: string }>("/api/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
    auth: false,
  });

export const apiRegister = (email: string, password: string, signup_token: string) =>
  request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { email, password, signup_token },
    auth: false,
  });

export const apiLogin = (email: string, password: string) =>
  request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });

// ----------------------
// Usage (daily free limit)
// ----------------------
export const fetchUsage = () =>
  request<{ limit: number; remaining: Record<ModelKey, number> }>("/api/usage");

// ----------------------
// Conversations
// ----------------------
export const listConversations = () => request<ConversationSummary[]>("/api/conversations");

export const createConversation = (models: ModelKey[]) =>
  request<ConversationSummary>("/api/conversations", { method: "POST", body: { models } });

export const getConversation = (id: string) =>
  request<ConversationDetail>(`/api/conversations/${id}`);

export const deleteConversation = (id: string) =>
  request<{ ok: boolean }>(`/api/conversations/${id}`, { method: "DELETE" });

export const createTurn = (id: string, prompt: string, model: ModelKey | null = null) =>
  request<{ turn: number; title: string; created_at: string }>(
    `/api/conversations/${id}/turns`,
    { method: "POST", body: { prompt, model } }
  );

export const askTurn = (id: string, turn: number, model: ModelKey) =>
  request<{ text: string; is_error: boolean; remaining: number }>(
    `/api/conversations/${id}/turns/${turn}/ask`,
    { method: "POST", body: { model } }
  );

// ----------------------
// Share
// ----------------------
export const createShare = (conversation_id: string, model: ModelKey) =>
  request<{ id: string; url: string }>("/api/share", {
    method: "POST",
    body: { conversation_id, model },
  });

export const getShare = (id: string) =>
  request<SharedChat>(`/api/share/${id}`, { auth: false });
