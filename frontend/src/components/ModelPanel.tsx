"use client";

import { useEffect, useMemo, useState } from "react";
import DotsLoader from "./DotsLoader";
import TypewriterText from "./TypewriterText";
import { askModel, createShare, type ModelKey } from "../utils/api";
import PromptInput from "./PromptInput";
import { getRemainingForToday, incrementUsage } from "../utils/auth";

const colorMap: Record<ModelKey, string> = {
  gpt: "mark-red",
  gemini: "mark-blue",
  perplexity: "mark-green",
  deepseek: "mark-yellow",
};

export default function ModelPanel({
  model,
  initialPrompt,
  onHeaderClick,
  onResponse,
  highlightMarkup,
}: {
  model: ModelKey;
  initialPrompt: string;
  onHeaderClick?: () => void;
  onResponse?: (text: string) => void;
  highlightMarkup?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string>("");

  async function run(prompt: string) {
    if (getRemainingForToday(model) <= 0) {
      setError("Daily limit reached (15)");
      return;
    }
    setLoading(true);
    setError(null);
    setResponse("");
    try {
      const { text } = await askModel(model, prompt);
      // console.log statements removed for clean console
      setResponse(text || "");
      incrementUsage(model);
      onResponse?.(text || "");
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialPrompt) run(initialPrompt);
  }, [initialPrompt]);

  const topBar = (
    <div className="flex items-center justify-between">
      <button onClick={onHeaderClick} className="text-left">
        <div className="text-sm text-muted">{model.toUpperCase()}</div>
        <div className="text-lg font-semibold">Model: {model}</div>
      </button>
      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost"
          onClick={() => {
            navigator.clipboard.writeText(response);
          }}
          disabled={!response}
          aria-label="Copy response"
        >
          Copy
        </button>
        <button
          className="btn btn-ghost"
          onClick={async () => {
            if (!response) return;
            const share = await createShare({
              model,
              prompt: initialPrompt,
              response,
            });
            await navigator.clipboard.writeText(share.url);
            alert("Share link copied!");
          }}
          disabled={!response}
          aria-label="Share response"
        >
          Share
        </button>
      </div>
    </div>
  );

  const body = useMemo(() => {
    if (loading) return <DotsLoader />;
    if (error) return <div className="text-red-400">{error}</div>;
    if (!response) return <div className="text-muted">No response yet.</div>;
    if (highlightMarkup) {
      return (
        <div
          className={`leading-relaxed whitespace-pre-wrap ${colorMap[model]}`}
          dangerouslySetInnerHTML={{ __html: highlightMarkup }}
        />
      );
    }
    return <TypewriterText text={response} />;
  }, [loading, error, response, model, highlightMarkup]);

  return (
    <section className="bg-panel border border-panel rounded-lg p-4 flex flex-col h-full">
      {topBar}
      <div className="mt-3 flex-1 overflow-auto">{body}</div>
      <div className="mt-3">
        <PromptInput
          placeholder={`Ask only ${model.toUpperCase()}... (${getRemainingForToday(
            model
          )} left today)`}
          onSubmit={(v) => run(v)}
          disabled={loading}
        />
      </div>
    </section>
  );
}
