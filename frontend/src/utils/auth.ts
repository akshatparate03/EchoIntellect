import type { ModelKey } from "./api";

const KEY_USERS = "ei:users"; // map email -> { hash }
const KEY_CURRENT = "ei:current"; // { email }
const KEY_USAGE = "ei:usage"; // map "email:date:model" -> count

function sha256(str: string): string {
  // naive hash (not crypto-subtle for simplicity in Vite dev)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

function load<T>(k: string, d: T): T {
  try {
    return JSON.parse(localStorage.getItem(k) || "");
  } catch {
    return d;
  }
}
function save<T>(k: string, v: T) {
  localStorage.setItem(k, JSON.stringify(v));
}

export function isAuthenticated(): boolean {
  const curr = load(KEY_CURRENT, null as null | { email: string });
  return !!curr?.email;
}

export function currentEmail(): string | null {
  const curr = load(KEY_CURRENT, null as null | { email: string });
  return curr?.email ?? null;
}

export function signUp(email: string, password: string) {
  const users = load<Record<string, { hash: string }>>(KEY_USERS, {});
  if (users[email]) throw new Error("User already exists");
  users[email] = { hash: sha256(password) };
  save(KEY_USERS, users);
  save(KEY_CURRENT, { email });
}

export function signIn(email: string, password: string) {
  const users = load<Record<string, { hash: string }>>(KEY_USERS, {});
  const user = users[email];
  if (!user || user.hash !== sha256(password))
    throw new Error("Invalid credentials");
  save(KEY_CURRENT, { email });
}

export function signOut() {
  localStorage.removeItem(KEY_CURRENT);
}

function usageKey(email: string, date: string, model: ModelKey) {
  return `${email}:${date}:${model}`;
}

export function getRemainingForToday(model: ModelKey): number {
  const email = currentEmail();
  if (!email) return 0;
  const usage = load<Record<string, number>>(KEY_USAGE, {});
  const date = new Date().toISOString().slice(0, 10);
  const count = usage[usageKey(email, date, model)] || 0;
  return Math.max(0, 15 - count);
}

export function incrementUsage(model: ModelKey) {
  const email = currentEmail();
  if (!email) return;
  const usage = load<Record<string, number>>(KEY_USAGE, {});
  const date = new Date().toISOString().slice(0, 10);
  const key = usageKey(email, date, model);
  usage[key] = (usage[key] || 0) + 1;
  save(KEY_USAGE, usage);
}
