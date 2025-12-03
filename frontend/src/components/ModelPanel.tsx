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
  const [response, setResponse] = useState<string>("");
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const fetchedPromptRef = useRef<string>("");
  const hasCalledOnResponseRef = useRef(false);
  const onResponseRef = useRef(onResponse);

  // Update onResponse ref
  useEffect(() => {
    onResponseRef.current = onResponse;
  }, [onResponse]);

  // Set existing response on mount ONCE
  useEffect(() => {
    if (existingResponse && !response && !fetchedPromptRef.current) {
      setResponse(existingResponse);
      setShouldAnimate(false);
      hasCalledOnResponseRef.current = true;
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
    setResponse("");
    setShouldAnimate(true);
    hasCalledOnResponseRef.current = false;

    try {
      const { text } = await askModel(model, prompt);
      const cleanText = String(text || "").trim();

      setResponse(cleanText);
      fetchedPromptRef.current = prompt;
      incrementUsage(model);

      // Call onResponse only once
      if (!hasCalledOnResponseRef.current) {
        onResponseRef.current?.(cleanText);
        hasCalledOnResponseRef.current = true;
      }
    } catch (error: any) {
      setError(error?.message || "Failed");
      setShouldAnimate(false);
    } finally {
      setLoading(false);
    }
  }

  // Only run when initialPrompt changes AND is not empty AND different from last
  useEffect(() => {
    if (
      initialPrompt &&
      initialPrompt.trim() !== "" &&
      initialPrompt !== fetchedPromptRef.current
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

    // Only animate new responses
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
        </button>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost"
            onClick={() => {
              navigator.clipboard.writeText(response);
              alert("Last response copied!");
            }}
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
          placeholder={`${model.toUpperCase()}... (${getRemainingForToday(
            model
          )} left today)`}
          onSubmit={(v) => run(v)}
          disabled={loading}
        />
      </div>
    </section>
  );
}
