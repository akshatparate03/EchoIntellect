import {
  apiCheckEmail,
  apiLogin,
  apiRegister,
  apiSendOtp,
  apiVerifyOtp,
} from "./api";
import { clearSession, getToken, getUser, setSession } from "./session";

// Is user authenticated?
export function isAuthenticated(): boolean {
  return !!getToken();
}

// Return current logged-in email
export function currentEmail(): string | null {
  return getUser()?.email ?? null;
}

// Return current logged-in user's full name
export function currentUserName(): string | null {
  return getUser()?.name || null;
}

// Check if user already exists
export async function checkUserExists(email: string): Promise<boolean> {
  return (await apiCheckEmail(email)).exists;
}

// SIGN UP - step 1: email the OTP
export async function sendOtp(name: string, email: string): Promise<void> {
  await apiSendOtp(name, email);
}

// SIGN UP - step 2: verify the OTP, returns a short-lived signup token
export async function verifyOtp(email: string, otp: string): Promise<string> {
  return (await apiVerifyOtp(email, otp)).signup_token;
}

// SIGN UP - step 3: create the account
export async function signUp(
  email: string,
  password: string,
  signupToken: string
): Promise<{ message: string }> {
  const res = await apiRegister(email, password, signupToken);
  setSession(res.token, res.user);
  return { message: res.message || "Account created successfully!" };
}

// SIGN IN
export async function signIn(email: string, password: string): Promise<{ message: string }> {
  const res = await apiLogin(email, password);
  setSession(res.token, res.user);
  return { message: res.message || "Logged in successfully!" };
}

// SIGN OUT
export function signOut() {
  clearSession();
}
