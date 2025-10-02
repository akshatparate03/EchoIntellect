const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export type ModelKey = "gpt" | "gemini" | "perplexity" | "deepseek";

export async function askModel(model: ModelKey, prompt: string) {
  const res = await fetch(`${BACKEND_URL}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt }),
  });
  if (!res.ok) throw new Error("API error");
  return (await res.json()) as { text: string };
}

export async function createShare(payload: {
  model: ModelKey;
  prompt: string;
  response: string;
}) {
  const res = await fetch(`${BACKEND_URL}/api/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Share failed");
  return (await res.json()) as { id: string; url: string };
}

export async function getShare(id: string) {
  const res = await fetch(`${BACKEND_URL}/api/share/${id}`);
  if (!res.ok) throw new Error("Not found");
  return (await res.json()) as {
    id: string;
    model: ModelKey;
    prompt: string;
    response: string;
    createdAt: string;
  };
}
