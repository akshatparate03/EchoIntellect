"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { signIn, signUp, isAuthenticated } from "../utils/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import LogoutToast from "../components/LogoutToast"; // 🔹 same toast animation reuse

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [search] = useSearchParams();
  const next = search.get("next") || "/";
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 For showing animated toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const headline = useMemo(
    () => (mode === "signin" ? "Welcome back" : "Create account"),
    [mode]
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  function switchMode() {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "signin") {
        signIn(email, pass);
        showToast("✅ Logged in successfully!");
      } else {
        signUp(email, pass);
        showToast("🌟 Welcome to EchoIntellect!");
      }

      setTimeout(() => {
        if (isAuthenticated()) nav(next);
      }, 2000);
    } catch (e: any) {
      const msg = e?.message || "Something went wrong!";
      setError(msg);
      showToast(msg);
      setIsLoading(false);
    }
  }

  // 🔹 Make toast stay a bit longer
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden text-fg">
      {/* 🔹 SAME BACKGROUND as About.tsx */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-grid" /> {/* grid pattern */}
        <div className="bg-ai-gradient" /> {/* animated gradient */}
      </div>

      {/* 🔹 Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/20">
          <div className="p-10">
            {/* Header */}
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3">
                {headline}
              </h2>
              <p className="text-gray-300 text-sm">
                {mode === "signin"
                  ? "Sign in to access your account"
                  : "Join us and start your journey"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-100">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-5 py-3 bg-gray-800/40 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-gray-800/60 hover:border-emerald-500/50 autofill:bg-gray-800/60"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-100">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-5 py-3 bg-gray-800/40 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-gray-800/60 hover:border-emerald-500/50"
                />
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-in fade-in duration-300">
                  {error}
                </div>
              )}

              <button
                disabled={isLoading}
                className="w-full px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {mode === "signin"
                      ? "Signing in..."
                      : "Creating account..."}
                  </>
                ) : mode === "signin" ? (
                  "Sign in"
                ) : (
                  "Sign up"
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
              <p className="text-gray-300 text-sm mb-3">
                {mode === "signin" ? "New here?" : "Already have an account?"}
              </p>
              <button
                onClick={switchMode}
                disabled={isLoading}
                className="px-6 py-2 rounded-lg font-medium text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/15 transition-all duration-300"
              >
                {mode === "signin" ? "Create account" : "Go to sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Reuse Logout-style toast for success message */}
      <LogoutToast
        show={toastVisible}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
