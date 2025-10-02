"use client";

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getShare } from "../utils/api";

export default function ShareView() {
  const { id } = useParams();
  const [state, setState] = useState<{
    loading: boolean;
    error?: string;
    prompt?: string;
    response?: string;
    model?: string;
  }>({ loading: true });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getShare(id!);
        if (!mounted) return;
        setState({
          loading: false,
          prompt: data.prompt,
          response: data.response,
          model: data.model,
        });
      } catch (e: any) {
        if (!mounted) return;
        setState({ loading: false, error: e?.message || "Not found" });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (state.loading)
    return <div className="mx-auto max-w-3xl px-4 py-10">Loading…</div>;
  if (state.error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-red-400">
        {state.error}
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <div className="text-sm text-muted">
        Model: {state.model?.toUpperCase()}
      </div>
      <h2 className="text-2xl font-semibold">Shared Chat</h2>
      <div className="bg-panel border border-panel rounded p-4">
        <div className="text-muted text-sm mb-2">Prompt</div>
        <div className="whitespace-pre-wrap">{state.prompt}</div>
      </div>
      <div className="bg-panel border border-panel rounded p-4">
        <div className="text-muted text-sm mb-2">Response</div>
        <div className="whitespace-pre-wrap leading-relaxed">
          {state.response}
        </div>
      </div>
      <div className="pt-2">
        <Link to="/login" className="btn btn-primary">
          Try yourself
        </Link>
      </div>
    </div>
  );
}
