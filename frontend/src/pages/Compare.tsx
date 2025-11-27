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

  const [prompt, setPrompt] = useState("");
  const [models, setModels] = useState<ModelKey[]>([]);

  const [responses, setResponses] = useState<ModelResponses>({
    gpt: undefined,
    gemini: undefined,
    perplexity: undefined,
    deepseek: undefined,
  });

  const [fullscreen, setFullscreen] = useState<ModelKey | null>(null);

  // ✅ FIXED: Track if responses have been loaded to prevent re-typing
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedSession = useRef(false);
  const isRestoringRef = useRef(false);

  /** Load previous comparison from sessionStorage (not localStorage) */
  useEffect(() => {
    const saved = sessionStorage.getItem("comparisonData");

    // If URL has params, use those (new search)
    if (promptParam && modelsParam.length > 0) {
      setPrompt(promptParam);
      setModels(modelsParam);
      setIsInitialLoad(true); // Trigger new search
      hasLoadedSession.current = true;
    } else if (saved && !hasLoadedSession.current) {
      // No URL params, restore from session ONCE
      try {
        const parsed = JSON.parse(saved);
        isRestoringRef.current = true; // Mark that we're restoring
        setPrompt(parsed.prompt);
        setModels(parsed.models);
        setResponses(parsed.responses);
        setIsInitialLoad(false); // Don't trigger typing again
        hasLoadedSession.current = true;

        // Clear the restoring flag after a short delay
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 100);
      } catch (e) {
        console.error("Failed to parse comparison data:", e);
      }
    }
  }, [promptParam, modelsParam]);

  /** Auth check */
  useEffect(() => {
    if (!isAuthenticated()) {
      nav(
        `/login?next=${encodeURIComponent(location.pathname + location.search)}`
      );
      return;
    }
  }, []);

  /** ✅ FIXED: Save to sessionStorage when responses update + trigger navbar immediately */
  useEffect(() => {
    const any = Object.values(responses).some(
      (r) => r && String(r).trim() !== ""
    );
    if (any) {
      sessionStorage.setItem(
        "comparisonData",
        JSON.stringify({
          prompt,
          responses,
          models,
        })
      );
    }
    // Also save when prompt exists (even before responses come)
    if (prompt && models.length > 0) {
      sessionStorage.setItem(
        "comparisonData",
        JSON.stringify({
          prompt,
          responses,
          models,
        })
      );
    }
  }, [responses, prompt, models]);

  function setResp(model: ModelKey, text: string) {
    const cleanText = String(text || "").trim();
    setResponses((prev) => ({ ...prev, [model]: cleanText }));
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-app text-fg">
      {/* Background */}
      <div className="bg-grid" />
      <div className="bg-ai-gradient" />

      {/* ✅ FIXED: Main content with proper height calculation */}
      <div
        className="relative z-10 flex-1 overflow-y-auto"
        style={{
          height: "calc(100vh - 4rem - 4rem)",
          marginTop: "4rem",
          marginBottom: "4rem",
        }}
      >
        <div className="mx-auto max-w-[1400px] px-4 py-4 h-full flex flex-col">
          {/* 4 static columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-shrink-0">
            {models.map((m) => (
              <div
                key={m}
                className={fullscreen && fullscreen !== m ? "hidden" : ""}
              >
                <ModelPanel
                  model={m}
                  initialPrompt={isInitialLoad ? prompt : ""}
                  onHeaderClick={() =>
                    setFullscreen((fs) => (fs === m ? null : m))
                  }
                  onResponse={(t) => setResp(m, t)}
                  existingResponse={responses[m]} // Pass existing response
                />
              </div>
            ))}
          </div>

          {/* ✅ FIXED: Input at bottom with minimal margin */}
          <div className="mt-4 max-w-[800px] mx-auto w-full flex-shrink-0">
            <PromptInput
              placeholder="Ask all selected models..."
              onSubmit={(p) => {
                setIsInitialLoad(true); // Reset for new query
                location.assign(
                  `/compare?prompt=${encodeURIComponent(
                    p
                  )}&models=${models.join(",")}`
                );
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer fixed at bottom */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#0f1620] border-t border-gray-800 z-50">
        <div className="mx-auto max-w-[1400px] px-4 py-3 text-center text-muted text-sm">
          © 2025 <span className="font-semibold text-white">EchoIntellect</span>
          . All rights reserved.
        </div>
      </footer>
    </div>
  );
}
