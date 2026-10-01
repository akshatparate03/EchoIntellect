import { useState } from "react";
import PromptInput from "../components/PromptInput";
import ModelSelectorDialog from "../components/ModelSelectorDialog";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { createConversation, type ModelKey } from "../utils/api";

export default function Home() {
  const [pendingPrompt, setPendingPrompt] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  function handleSubmit(p: string) {
    if (!isAuthenticated()) {
      nav(`/login?next=${encodeURIComponent("/")}`);
      return;
    }
    setError(null);
    setPendingPrompt(p);
    setOpen(true);
  }

  async function onConfirm(models: ModelKey[]) {
    setOpen(false);
    setStarting(true);
    setError(null);
    try {
      // New chat is saved in the database, the first prompt is sent from the chat page
      const conv = await createConversation(models);
      nav(`/chat/${conv.id}`, { state: { firstPrompt: pendingPrompt } });
    } catch (e: any) {
      setError(e?.message || "Could not start the chat. Please try again.");
      setStarting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col bg-app text-fg"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      {/* Background layers */}
      <div className="bg-grid fixed inset-0" />
      <div className="bg-ai-gradient fixed inset-0" />

      {/* Spacer for navbar */}
      <div style={{ height: "var(--header-height)", flexShrink: 0 }} />

      {/* Main content area - Centered with proper spacing */}
      <div
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        style={{ minHeight: 0 }}
      >
        <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold mb-3 sm:mb-6 leading-tight px-2 sm:whitespace-nowrap">
            Ask once and Learn from many AI minds.
          </h1>
          <p className="text-muted text-sm sm:text-lg md:text-xl mb-4 sm:mb-8 px-4">
            One platform to explore, compare, and learn from advanced AI models
          </p>

          <div className="relative w-full max-w-2xl mx-auto px-2">
            <PromptInput
              placeholder="Enter your prompt..."
              onSubmit={handleSubmit}
              autoFocus
              disabled={starting}
            />
            {starting && <p className="text-muted text-sm mt-3">Starting your chat…</p>}
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>
        </div>
      </div>

      {/* Spacer for footer */}
      <div style={{ height: "var(--footer-height)", flexShrink: 0 }} />

      {/* Model selector dialog */}
      <ModelSelectorDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
      />
    </div>
  );
}
