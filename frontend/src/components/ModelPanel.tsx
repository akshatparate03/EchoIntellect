"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
  existingResponse,
}: {
  model: ModelKey;
  initialPrompt: string;
  onHeaderClick?: () => void;
  onResponse?: (text: string) => void;
  existingResponse?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string>(existingResponse || "");
  const [shouldAnimate, setShouldAnimate] = useState(false); // ✅ Track if we should animate

  // ✅ FIXED: Track if we've already fetched for this prompt to prevent re-fetching
  const fetchedPromptRef = useRef<string>("");
  const mountedRef = useRef(false);

  // ✅ FIXED: Update response when existingResponse changes (without re-typing)
  useEffect(() => {
    if (existingResponse && !response) {
      // Only set if we don't have a response yet
      setResponse(existingResponse);
      setShouldAnimate(false); // Don't animate existing response
      fetchedPromptRef.current = initialPrompt; // Mark as already fetched
    }
  }, [existingResponse]);

  /** Model generation logic */
  async function run(prompt: string) {
    if (getRemainingForToday(model) <= 0) {
      setError("Daily limit reached (15)");
      return;
    }

    setLoading(true);
    setError(null);
    setShouldAnimate(true); // ✅ Enable animation for new response

    try {
      const { text } = await askModel(model, prompt);
      const cleanText = String(text || "").trim();
      setResponse(cleanText);
      incrementUsage(model);
      onResponse?.(cleanText);
      fetchedPromptRef.current = prompt; // Mark this prompt as fetched
    } catch (error: any) {
      setError(error?.message || "Failed");
      setShouldAnimate(false);
    } finally {
      setLoading(false);
    }
  }

  // ✅ FIXED: Load from parent's response prop if available on mount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ✅ FIXED: Only run if initialPrompt is new and not empty
  useEffect(() => {
    if (
      initialPrompt &&
      initialPrompt !== fetchedPromptRef.current &&
      mountedRef.current
    ) {
      run(initialPrompt);
    }
  }, [initialPrompt]);

  /** Smooth displayed body */
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

    // ✅ FIXED: Only animate when shouldAnimate is true (new response)
    return shouldAnimate ? (
      <TypewriterText text={response} onDone={() => setShouldAnimate(false)} />
    ) : (
      <div className="whitespace-pre-wrap leading-relaxed">{response}</div>
    );
  }, [loading, error, response, shouldAnimate]);

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

      {/* Input Box */}
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
