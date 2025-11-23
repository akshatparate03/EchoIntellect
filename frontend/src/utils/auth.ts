import type { ModelKey } from "./api";

const KEY_USERS = "ei:users"; // map: email -> { hash }
const KEY_CURRENT = "ei:current"; // { email }
const KEY_USAGE = "ei:usage"; // map: "email:date:model" -> count

// Simple hash function (non-crypto, just for local dev)
function sha256(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

// Load from localStorage
function load<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

// Save to localStorage
function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ----------------------
// AUTH FUNCTIONS
// ----------------------

// Is user authenticated?
export function isAuthenticated(): boolean {
  const curr = load<{ email: string } | null>(KEY_CURRENT, null);
  return !!curr?.email;
}

// Return current logged-in email
export function currentEmail(): string | null {
  const curr = load<{ email: string } | null>(KEY_CURRENT, null);
  return curr?.email ?? null;
}

// SIGN UP
export function signUp(email: string, password: string): { message: string } {
  const users = load<Record<string, { hash: string }>>(KEY_USERS, {});

  if (users[email]) {
    throw new Error("User already exists");
  }

  users[email] = { hash: sha256(password) };
  save(KEY_USERS, users);
  save(KEY_CURRENT, { email });

  return { message: "Account created successfully!" };
}

// SIGN IN
export function signIn(email: string, password: string): { message: string } {
  const users = load<Record<string, { hash: string }>>(KEY_USERS, {});
  const user = users[email];

  if (!user || user.hash !== sha256(password)) {
    throw new Error("Invalid credentials");
  }

  save(KEY_CURRENT, { email });

  return { message: "Logged in successfully!" };
}

// SIGN OUT
export function signOut() {
  localStorage.removeItem(KEY_CURRENT);
}

// ----------------------
// DAILY USAGE LIMITS
// ----------------------

function usageKey(email: string, date: string, model: ModelKey): string {
  return `${email}:${date}:${model}`;
}

// Get remaining free usage for today (limit = 15)
export function getRemainingForToday(model: ModelKey): number {
  const email = currentEmail();
  if (!email) return 0;

  const usage = load<Record<string, number>>(KEY_USAGE, {});
  const date = new Date().toISOString().slice(0, 10);

  const count = usage[usageKey(email, date, model)] || 0;

  return Math.max(0, 15 - count);
}

// Increment usage
export function incrementUsage(model: ModelKey) {
  const email = currentEmail();
  if (!email) return;

  const usage = load<Record<string, number>>(KEY_USAGE, {});
  const date = new Date().toISOString().slice(0, 10);

  const key = usageKey(email, date, model);
  usage[key] = (usage[key] || 0) + 1;

  save(KEY_USAGE, usage);
}
