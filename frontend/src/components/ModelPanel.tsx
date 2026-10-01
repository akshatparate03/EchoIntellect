import { useEffect, useRef, useState } from "react";
import DotsLoader from "./DotsLoader";
import TypewriterText from "./TypewriterText";
import LogoutToast from "./LogoutToast";
import PromptInput from "./PromptInput";
import { createShare, type ModelKey, type Turn } from "../utils/api";

export default function ModelPanel({
  model,
  conversationId,
  turns,
  pending,
  localErrors,
  animateKeys,
  onTypingDone,
  remaining,
  onAsk,
  onRetry,
  onHeaderClick,
  isFullscreen = false,
}: {
  model: ModelKey;
  conversationId: string;
  /** only the turns meant for this model */
  turns: Turn[];
  pending: Record<string, boolean>;
  localErrors: Record<string, string>;
  /** keys ("turn:model") of fresh answers that should be typed out */
  animateKeys: Set<string>;
  onTypingDone: (key: string) => void;
  remaining?: number;
  onAsk: (prompt: string) => void;
  onRetry: (turn: number) => void;
  onHeaderClick?: () => void;
  isFullscreen?: boolean;
}) {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const key = (t: number) => `${t}:${model}`;
  const anyPending = turns.some((t) => pending[key(t.turn)]);
  const lastAnswered = [...turns]
    .reverse()
    .find((t) => t.responses[model] && !t.responses[model]!.is_error);

  // keep the newest message in view
  const lastTurn = turns.length ? turns[turns.length - 1].turn : 0;
  const hasLastResponse = !!(lastTurn && turns[turns.length - 1].responses[model]);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [lastTurn, hasLastResponse, anyPending]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Response copied to clipboard!");
  };

  async function share() {
    try {
      const s = await createShare(conversationId, model);
      await navigator.clipboard.writeText(s.url);
      showToast("Share link copied to clipboard!");
    } catch (e: any) {
      showToast(e?.message || "Failed to create share link!");
    }
  }

  return (
    <section
      className={`bg-panel/80 border border-panel rounded-xl p-4 flex flex-col backdrop-blur-md shadow-lg min-h-0 ${
        isFullscreen ? "h-full" : "h-[70vh] lg:h-full"
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
            onClick={() => lastAnswered && copy(lastAnswered.responses[model]!.content)}
            disabled={!lastAnswered}
          >
            Copy
          </button>
          <button
            className="btn btn-ghost text-xs sm:text-sm px-2 sm:px-4"
            onClick={share}
            disabled={!lastAnswered}
          >
            Share
          </button>
        </div>
      </div>

      {/* Scrollable thread */}
      <div ref={scrollRef} className="mt-3 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 space-y-5">
        {turns.length === 0 && <div className="text-muted text-sm">No response yet.</div>}

        {turns.map((t) => {
          const k = key(t.turn);
          const r = t.responses[model];
          const isPending = !!pending[k];
          const localErr = localErrors[k];

          return (
            <div key={t.turn} className="space-y-2">
              {/* user prompt */}
              <div className="flex justify-end">
                <div className="max-w-[90%] rounded-2xl rounded-br-sm bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 px-3 py-2 text-sm whitespace-pre-wrap break-words">
                  {t.prompt}
                </div>
              </div>

              {/* model answer */}
              <div>
                {isPending ? (
                  <div className="flex items-center justify-center py-6">
                    <DotsLoader />
                  </div>
                ) : localErr ? (
                  <div className="text-red-400 text-sm">
                    {localErr}{" "}
                    {!localErr.startsWith("Daily limit") && (
                      <button className="underline" onClick={() => onRetry(t.turn)}>
                        Retry
                      </button>
                    )}
                  </div>
                ) : r?.is_error ? (
                  <div className="text-red-400 text-sm whitespace-pre-wrap">
                    {r.content}{" "}
                    <button className="underline" onClick={() => onRetry(t.turn)}>
                      Retry
                    </button>
                  </div>
                ) : r ? (
                  <>
                    {animateKeys.has(k) ? (
                      <TypewriterText text={r.content} onDone={() => onTypingDone(k)} />
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">{r.content}</div>
                    )}
                    <button
                      className="mt-1 text-xs text-muted hover:text-white transition-colors"
                      onClick={() => copy(r.content)}
                    >
                      Copy
                    </button>
                  </>
                ) : (
                  <div className="text-muted text-sm">
                    No response yet.{" "}
                    <button className="underline" onClick={() => onRetry(t.turn)}>
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Box - ask only this model */}
      <div className="mt-3 flex-shrink-0">
        <PromptInput
          placeholder={`${model.toUpperCase()}...${
            remaining !== undefined ? ` (${remaining} left today)` : ""
          }`}
          onSubmit={onAsk}
          disabled={anyPending}
        />
      </div>

      <LogoutToast show={toastVisible} message={toastMessage} onClose={() => setToastVisible(false)} />
    </section>
  );
}
