"use client";

import { useState } from "react";
import PromptInput from "../components/PromptInput";
import ModelSelectorDialog from "../components/ModelSelectorDialog";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import type { ModelKey } from "../utils/api";

export default function Home() {
  const [pendingPrompt, setPendingPrompt] = useState<string>("");
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  function handleSubmit(p: string) {
    if (!isAuthenticated()) {
      nav(`/login?next=${encodeURIComponent("/")}`);
      return;
    }
    setPendingPrompt(p);
    setOpen(true);
  }

  function onConfirm(models: ModelKey[]) {
    setOpen(false);
    nav(
      `/compare?prompt=${encodeURIComponent(
        pendingPrompt
      )}&models=${models.join(",")}`
    );
  }

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-app text-fg">
      {/* Background layers */}
      <div className="bg-grid" />
      <div className="bg-ai-gradient" />

      {/* Main content area - Centered with proper spacing */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 py-8 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full space-y-6 sm:space-y-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 sm:mb-6 text-balance leading-tight px-2">
            Ask once and Learn from many AI minds.
          </h1>
          <p className="text-muted text-base sm:text-lg md:text-xl mb-6 sm:mb-8 px-4">
            One platform to explore, compare, and learn from advanced AI models
          </p>

          <div className="relative w-full max-w-2xl mx-auto px-2">
            <PromptInput
              placeholder="Enter your prompt..."
              onSubmit={handleSubmit}
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Model selector dialog */}
      <ModelSelectorDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
      />
    </div>
  );
}
