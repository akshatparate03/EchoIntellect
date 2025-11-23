"use client";

import { useEffect, useState, useMemo } from "react";
import DotsLoader from "./DotsLoader";
import TypewriterText from "./TypewriterText";
import { askModel, createShare, type ModelKey } from "../utils/api";
import PromptInput from "./PromptInput";
import { getRemainingForToday, incrementUsage } from "../utils/auth";

export default function ModelPanel({
  model,
  initialPrompt,
  onHeaderClick,
  onResponse,
}: {
  model: ModelKey;
  initialPrompt: string;
  onHeaderClick?: () => void;
  onResponse?: (text: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string>("");

  /** ⭐ Model generation logic (no stop button / no abort logic) */
  async function run(prompt: string) {
    if (getRemainingForToday(model) <= 0) {
      setError("Daily limit reached (15)");
      return;
    }

    setLoading(true);
    setError(null);

    if (response.trim() === "") setResponse("");

    try {
      const { text } = await askModel(model, prompt);
      // FIXED: Ensure text is always a clean string, never undefined
      const cleanText = String(text || "").trim();
      setResponse(cleanText);
      incrementUsage(model);
      onResponse?.(cleanText);
    } catch (error: any) {
      setError(error?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialPrompt && response === "") {
      run(initialPrompt);
    }
  }, [initialPrompt]);

  /** ⭐ Smooth displayed body */
  const body = useMemo(() => {
    if (loading)
      return (
        <div className="flex items-center justify-center h-full py-8">
          <DotsLoader />
        </div>
      );

    if (error) return <div className="text-red-400">{error}</div>;
    if (!response)
      return <div className="text-muted text-sm">No response yet.</div>;

    return <TypewriterText text={response} />;
  }, [loading, error, response]);

  return (
    <section className="bg-panel/80 border border-panel rounded-xl p-4 flex flex-col h-[500px] backdrop-blur-md shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onHeaderClick} className="text-left">
          <div className="text-sm text-muted">{model.toUpperCase()}</div>
          <div className="text-lg font-semibold">Model: {model}</div>
        </button>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost"
            onClick={() => navigator.clipboard.writeText(response)}
            disabled={!response}
          >
            Copy
          </button>

          <button
            className="btn btn-ghost"
            disabled={!response}
            onClick={async () => {
              const share = await createShare({
                model,
                prompt: initialPrompt,
                response,
              });
              await navigator.clipboard.writeText(share.url);
              alert("Share link copied!");
            }}
          >
            Share
          </button>
        </div>
      </div>

      {/* Scrollable Response */}
      <div className="mt-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {body}
      </div>

      {/* Input Box (no stop button now) */}
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
