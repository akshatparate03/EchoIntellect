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
  currentPrompt,
  onHeaderClick,
  onResponse,
  existingResponse,
  isFullscreen = false,
}: {
  model: ModelKey;
  initialPrompt: string;
  currentPrompt?: string;
  onHeaderClick?: () => void;
  onResponse?: (text: string) => void;
  existingResponse?: string;
  isFullscreen?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string>("");
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchedPromptRef = useRef<string>("");
  const lastUsedPromptRef = useRef<string>(""); // Track last actually used prompt
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

  // Show toast function
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => setToastVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

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
      lastUsedPromptRef.current = prompt; // Update last used prompt
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
    <section
      className={`bg-panel/80 border border-panel rounded-xl p-4 flex flex-col backdrop-blur-md shadow-lg ${
        isFullscreen ? "h-full" : "h-[500px] lg:h-[calc(100vh-14rem)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <button onClick={onHeaderClick} className="text-left">
          <div className="text-sm text-muted">{model.toUpperCase()}</div>
        </button>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost text-xs sm:text-sm px-2 sm:px-4"
            onClick={() => {
              navigator.clipboard.writeText(response);
              showToast("Response copied to clipboard!");
            }}
            disabled={!response}
          >
            Copy
          </button>

          <button
            className="btn btn-ghost text-xs sm:text-sm px-2 sm:px-4"
            disabled={!response}
            onClick={async () => {
              try {
                // Priority: lastUsedPrompt > currentPrompt > fetchedPrompt
                const promptToShare =
                  lastUsedPromptRef.current ||
                  currentPrompt ||
                  fetchedPromptRef.current;

                if (!promptToShare) {
                  showToast("No prompt to share!");
                  return;
                }

                const share = await createShare({
                  model,
                  prompt: promptToShare,
                  response,
                });
                await navigator.clipboard.writeText(share.url);
                showToast("Share link copied to clipboard!");
              } catch (error) {
                showToast("Failed to create share link!");
              }
            }}
          >
            Share
          </button>
        </div>
      </div>

      {/* Scrollable Response */}
      <div className="mt-3 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        {body}
      </div>

      {/* Input Box */}
      <div className="mt-3 flex-shrink-0">
        <PromptInput
          placeholder={`${model.toUpperCase()}... (${getRemainingForToday(
            model
          )} left today)`}
          onSubmit={(v) => run(v)}
          disabled={loading}
        />
      </div>

      {/* Toast Component - Same Style as Login/Contact */}
      {toastVisible && (
        <div className="fixed top-[90px] right-6 bg-[#111827]/90 text-white px-4 py-3 rounded-xl border border-gray-600/70 shadow-xl backdrop-blur-md z-[9999] animate-toastSlideIn">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <p className="text-sm font-medium">{toastMessage}</p>
            <button
              onClick={() => setToastVisible(false)}
              className="text-gray-300 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Toast Animation CSS */}
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-toastSlideIn {
          animation: toastSlideIn 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}
