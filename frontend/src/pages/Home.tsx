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
    <div className="mx-auto max-w-3xl px-4 py-16 min-h-[70dvh] flex flex-col justify-center">
      <h1 className="text-3xl md:text-4xl font-semibold text-balance mb-6">
        Ask once. Compare across multiple AI models.
      </h1>
      <p className="text-muted mb-6">
        Dark theme only. Select up to four models to compare.
      </p>
      <div className="relative">
        <PromptInput
          placeholder="Enter your prompt..."
          onSubmit={handleSubmit}
          autoFocus
        />
      </div>
      <ModelSelectorDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
      />
    </div>
  );
}
