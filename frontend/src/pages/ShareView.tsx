"use client";

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getShare } from "../utils/api";

// ----------------------
// Strong State Type
// ----------------------
type ShareState = {
  loading: boolean;
  error?: string;
  prompt: string;
  response: string;
  model: string;
};

export default function ShareView() {
  const { id } = useParams();

  const [state, setState] = useState<ShareState>({
    loading: true,
    error: undefined,
    prompt: "",
    response: "",
    model: "",
  });

  // Fetch share data
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getShare(id!);
        if (!mounted) return;

        setState({
          loading: false,
          error: undefined,
          prompt: data.prompt,
          response: data.response,
          model: data.model,
        });
      } catch (e: any) {
        if (!mounted) return;

        setState({
          loading: false,
          error: e?.message || "Not found",
          prompt: "",
          response: "",
          model: "",
        });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  // Loading UI
  if (state.loading)
    return (
      <div className="relative flex flex-col min-h-screen bg-app text-fg">
        <div className="bg-grid" />
        <div className="bg-ai-gradient" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20">
          Loading…
        </div>
      </div>
    );

  // Error UI
  if (state.error)
    return (
      <div className="relative flex flex-col min-h-screen bg-app text-fg">
        <div className="bg-grid" />
        <div className="bg-ai-gradient" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-red-400">
          {state.error}
        </div>
      </div>
    );

  // Main View
  return (
    <div className="relative flex flex-col min-h-screen bg-app text-fg overflow-hidden">
      <div className="bg-grid" />
      <div className="bg-ai-gradient" />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl bg-panel/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 space-y-6 gradient-border">
          {/* Model */}
          <div className="text-sm text-muted text-center">
            Model: {state.model?.toUpperCase()}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-semibold text-center">Shared Chat</h2>

          {/* Prompt Box */}
          <div className="bg-panel/60 rounded-xl p-4 gradient-border">
            <div className="text-muted text-sm mb-2">Prompt</div>
            <div className="whitespace-pre-wrap leading-relaxed">
              {state.prompt}
            </div>
          </div>

          {/* Response Box */}
          <div className="bg-panel/60 rounded-xl p-4 gradient-border">
            <div className="text-muted text-sm mb-2">Response</div>
            <div className="whitespace-pre-wrap leading-relaxed">
              {state.response}
            </div>
          </div>

          {/* Button */}
          <div className="pt-2 flex justify-center">
            <Link to="/" className="btn btn-primary">
              Try yourself
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
