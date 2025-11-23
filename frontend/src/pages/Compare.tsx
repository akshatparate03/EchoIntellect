"use client";

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import ModelPanel from "../components/ModelPanel";
import type { ModelKey } from "../utils/api";
import PromptInput from "../components/PromptInput";
import { type ModelResponses } from "../utils/diff";

export default function Compare() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const promptParam = params.get("prompt") || "";
  const modelsParam = (params.get("models") || "")
    .split(",")
    .filter(Boolean) as ModelKey[];

  const [prompt, setPrompt] = useState(promptParam);
  const [models, setModels] = useState<ModelKey[]>(modelsParam);

  const [responses, setResponses] = useState<ModelResponses>({
    gpt: undefined,
    gemini: undefined,
    perplexity: undefined,
    deepseek: undefined,
  });

  const [fullscreen, setFullscreen] = useState<ModelKey | null>(null);

  // In-memory storage (replaces localStorage which isn't supported in artifacts)
  const comparisonDataRef = useRef<{
    prompt: string;
    models: ModelKey[];
    responses: ModelResponses;
  } | null>(null);

  /** Load previous comparison only once (from memory, not localStorage) */
  useEffect(() => {
    if (
      comparisonDataRef.current &&
      (!promptParam || modelsParam.length === 0)
    ) {
      const saved = comparisonDataRef.current;
      setPrompt(saved.prompt);
      setModels(saved.models);
      setResponses(saved.responses);
    }
  }, []);

  /** Auth check */
  useEffect(() => {
    if (!isAuthenticated()) {
      nav(
        `/login?next=${encodeURIComponent(location.pathname + location.search)}`
      );
      return;
    }
  }, []);

  /** Save comparison once responses available (to memory) */
  useEffect(() => {
    const any = Object.values(responses).some(
      (r) => r && String(r).trim() !== ""
    );
    if (any) {
      comparisonDataRef.current = {
        prompt,
        responses,
        models,
      };
    }
  }, [responses, prompt, models]);

  function setResp(model: ModelKey, text: string) {
    // Ensure text is always a clean string, never undefined
    const cleanText = String(text || "").trim();
    setResponses((prev) => ({ ...prev, [model]: cleanText }));
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-app text-fg overflow-hidden">
      {/* Background */}
      <div className="bg-grid" />
      <div className="bg-ai-gradient" />

      {/* Content wrapper no-scroll */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pt-6">
        {/* 4 static columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {models.map((m) => (
            <div
              key={m}
              className={fullscreen && fullscreen !== m ? "hidden" : ""}
            >
              <ModelPanel
                model={m}
                initialPrompt={prompt}
                onHeaderClick={() =>
                  setFullscreen((fs) => (fs === m ? null : m))
                }
                onResponse={(t) => setResp(m, t)}
              />
            </div>
          ))}
        </div>

        {/* Global input above footer */}
        <div className="mt-6 mb-28 max-w-[800px] mx-auto">
          <PromptInput
            placeholder="Ask all selected models..."
            onSubmit={(p) => {
              location.assign(
                `/compare?prompt=${encodeURIComponent(p)}&models=${models.join(
                  ","
                )}`
              );
            }}
          />
        </div>
      </div>

      {/* Footer fixed at bottom */}
      <footer className="absolute bottom-0 left-0 w-full bg-transparent">
        <div className="mx-auto max-w-[1400px] px-4 py-4 text-center text-muted">
          © 2025 <span className="font-semibold text-white">EchoIntellect</span>
          . All rights reserved.
        </div>
      </footer>
    </div>
  );
}
