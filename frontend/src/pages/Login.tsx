"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { signIn, signUp, isAuthenticated } from "../utils/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import LogoutToast from "../components/LogoutToast";

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [search] = useSearchParams();
  const next = search.get("next") || "/";
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Toast
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

  const switchMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError(null);
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let res;

      if (mode === "signin") {
        res = await signIn(email, pass);
        showToast(res?.message || "Logged in successfully!");
      } else {
        res = await signUp(email, pass);
        showToast(res?.message || "Welcome to EchoIntellect!");
      }

      // Navigate after success
      setTimeout(() => {
        if (isAuthenticated()) nav(next);
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || "Something went wrong!";
      setError(msg);
      showToast(msg);
      setIsLoading(false);
    }
  }

  // Auto-hide toast
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  return (
    <div
      className="fixed inset-0 w-screen h-screen flex items-center justify-center overflow-hidden text-white"
      style={{
        backgroundImage: `url('/Images/LoginBG.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60 -z-10" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-gray-900/70 backdrop-blur-xl border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/20">
          <div className="p-10">
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
                  className="w-full px-5 py-3 bg-gray-800/40 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
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
                  className="w-full px-5 py-3 bg-gray-800/40 border border-emerald-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                disabled={isLoading}
                className="w-full px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/30"
              >
                {isLoading
                  ? mode === "signin"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "signin"
                  ? "Sign in"
                  : "Sign up"}
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
                className="px-6 py-2 rounded-lg text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/15 transition-all duration-200 disabled:opacity-50"
              >
                {mode === "signin" ? "Create account" : "Go to sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <LogoutToast
        show={toastVisible}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />

      <style>{`
        /* Remove scrollbar completely */
        html, body {
          overflow: hidden !important;
          height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
        }
        
        ::-webkit-scrollbar {
          display: none !important;
        }
        
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
    </div>
  );
}
