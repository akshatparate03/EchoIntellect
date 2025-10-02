"use client";

import type React from "react";

import { useMemo, useState } from "react";
import { signIn, signUp, isAuthenticated } from "../utils/auth";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [search] = useSearchParams();
  const next = search.get("next") || "/";
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);

  const headline = useMemo(
    () => (mode === "signin" ? "Welcome back" : "Create account"),
    [mode]
  );

  function switchMode() {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "signin") signIn(email, pass);
      else signUp(email, pass);
      if (isAuthenticated()) nav(next);
    } catch (e: any) {
      setError(e?.message || "Failed");
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center px-4">
      <div className="w-full max-w-4xl bg-panel border border-panel rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6">{headline}</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
              </div>
              {error && <div className="text-red-400">{error}</div>}
              <button className="btn btn-primary w-full">
                {mode === "signin" ? "Sign in" : "Sign up"}
              </button>
            </form>
          </div>
          <div className="p-8 bg-[#0a0f15] border-l border-panel grid place-items-center">
            <div className="text-center">
              <div className="text-muted mb-2">
                {mode === "signin" ? "New here?" : "Already have an account?"}
              </div>
              <button className="btn btn-ghost" onClick={switchMode}>
                {mode === "signin" ? "Create account" : "Go to sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
