"use client";

import type React from "react";

import { useState } from "react";

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setErr(null);
    const data = new FormData(e.currentTarget);
    try {
      if (!APPS_SCRIPT_URL) throw new Error("Apps Script URL not set");
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: data,
        mode: "no-cors",
      });
      // no-cors: assume success
      setOk("Feedback sent!");
      e.currentTarget.reset();
    } catch (e: any) {
      setErr(e?.message || "Failed to send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h2 className="text-2xl font-semibold mb-4">Send Feedback</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input className="input" name="name" required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" name="email" required />
        </div>
        <div>
          <label className="label">Feedback / Issue</label>
          <textarea className="input" name="message" rows={5} required />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
        {ok && <div className="text-green-400">{ok}</div>}
        {err && <div className="text-red-400">{err}</div>}
      </form>
    </div>
  );
}
