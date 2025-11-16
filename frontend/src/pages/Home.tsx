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
    <div className="relative flex flex-col min-h-screen bg-app text-fg">
      {/* Background layers */}
      <div className="bg-grid" />
      <div className="bg-ai-gradient" />

      {/* Main content area */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-semibold mb-6 text-balance">
          Ask once and Learn from many AI minds.
        </h1>
        <p className="text-muted mb-8 text-lg">
          One platform to explore, compare, and learn from advanced AI models
        </p>

        <div className="relative w-full max-w-2xl mx-auto">
          <PromptInput
            placeholder="Enter your prompt..."
            onSubmit={handleSubmit}
            autoFocus
          />
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
