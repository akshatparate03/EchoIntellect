import { useParams, Link } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { getShare, type SharedChat } from "../utils/api";

type ShareState = {
  loading: boolean;
  error?: string;
  data?: SharedChat;
};

export default function ShareView() {
  const { id } = useParams();
  const [state, setState] = useState<ShareState>({ loading: true });

  useEffect(() => {
    let mounted = true;
    setState({ loading: true });

    getShare(id!)
      .then((data) => mounted && setState({ loading: false, data }))
      .catch((e: any) => mounted && setState({ loading: false, error: e?.message || "Not found" }));

    return () => {
      mounted = false;
    };
  }, [id]);

  const shell = (children: ReactNode) => (
    <div className="relative flex flex-col min-h-screen bg-app text-fg custom-scrollbar">
      <div className="bg-grid" />
      <div className="bg-ai-gradient" />
      {children}
    </div>
  );

  if (state.loading)
    return shell(<div className="relative z-10 mx-auto max-w-3xl px-4 py-20">Loading…</div>);

  if (state.error || !state.data)
    return shell(
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-red-400">{state.error}</div>
    );

  const { model, items } = state.data;

  return shell(
    <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl bg-panel/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 space-y-6 border border-panel">
        <div className="text-sm text-muted text-center">Model: {model.toUpperCase()}</div>

        <h2 className="text-3xl font-semibold text-center">Shared Chat</h2>

        {items.map((it, i) => (
          <div key={i} className="space-y-3">
            <div className="bg-panel/60 rounded-xl p-4 border border-panel">
              <div className="text-muted text-sm mb-2">Prompt</div>
              <div className="whitespace-pre-wrap leading-relaxed break-words">{it.prompt}</div>
            </div>

            <div className="bg-panel/60 rounded-xl p-4 border border-panel">
              <div className="text-muted text-sm mb-2">Response</div>
              <div className="whitespace-pre-wrap leading-relaxed break-words">{it.response}</div>
            </div>
          </div>
        ))}

        <div className="pt-2 flex justify-center">
          <Link to="/" className="btn btn-primary">
            Try yourself
          </Link>
        </div>
      </div>
    </div>
  );
}
