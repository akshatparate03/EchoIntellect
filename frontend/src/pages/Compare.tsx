"use client";

import { useEffect, useState, useRef, useMemo } from "react";
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const hasLoadedSession = useRef(false);
  const isRestoringRef = useRef(false);

  /** Load from sessionStorage - RUNS ONLY ONCE */
  useEffect(() => {
    if (hasLoadedSession.current) return;

    const saved = sessionStorage.getItem("comparisonData");

    if (promptParam && modelsParam.length > 0) {
      setPrompt(promptParam);
      setModels(modelsParam);
      setIsInitialLoad(true);
      hasLoadedSession.current = true;
    } else if (saved) {
      try {
        const parsed = JSON.parse(saved);
        isRestoringRef.current = true;
        setPrompt(parsed.prompt);
        setModels(parsed.models);
        setResponses(parsed.responses);
        setIsInitialLoad(false);
        hasLoadedSession.current = true;

        setTimeout(() => {
          isRestoringRef.current = false;
        }, 200);
      } catch (e) {
        console.error("Failed to parse comparison data:", e);
      }
    }
  }, [promptParam, modelsParam]);

  /** Auth check - RUNS ONLY ONCE */
  useEffect(() => {
    if (!isAuthenticated()) {
      nav(
        `/login?next=${encodeURIComponent(location.pathname + location.search)}`
      );
    }
  }, [nav]);

  /** Save to sessionStorage - NO DEPENDENCY ON prompt/models */
  useEffect(() => {
    // Skip if restoring
    if (isRestoringRef.current) return;

    // Skip if no models
    if (models.length === 0) return;

    // Check if any response exists
    const hasAnyResponse = Object.values(responses).some(
      (r) => r && String(r).trim() !== ""
    );

    // Only save if we have responses
    if (hasAnyResponse) {
      const timer = setTimeout(() => {
        sessionStorage.setItem(
          "comparisonData",
          JSON.stringify({ prompt, responses, models })
        );
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    responses.gpt,
    responses.gemini,
    responses.perplexity,
    responses.deepseek,
  ]);

  /** Create stable callback functions for each model */
  const handleGptResponse = useMemo(
    () => (text: string) => {
      const cleanText = String(text || "").trim();
      setResponses((prev) => {
        if (prev.gpt === cleanText) return prev;
        return { ...prev, gpt: cleanText };
      });
    },
    []
  );

  const handleGeminiResponse = useMemo(
    () => (text: string) => {
      const cleanText = String(text || "").trim();
      setResponses((prev) => {
        if (prev.gemini === cleanText) return prev;
        return { ...prev, gemini: cleanText };
      });
    },
    []
  );

  const handlePerplexityResponse = useMemo(
    () => (text: string) => {
      const cleanText = String(text || "").trim();
      setResponses((prev) => {
        if (prev.perplexity === cleanText) return prev;
        return { ...prev, perplexity: cleanText };
      });
    },
    []
  );

  const handleDeepseekResponse = useMemo(
    () => (text: string) => {
      const cleanText = String(text || "").trim();
      setResponses((prev) => {
        if (prev.deepseek === cleanText) return prev;
        return { ...prev, deepseek: cleanText };
      });
    },
    []
  );

  // Map model to handler
  const getResponseHandler = (model: ModelKey) => {
    switch (model) {
      case "gpt":
        return handleGptResponse;
      case "gemini":
        return handleGeminiResponse;
      case "perplexity":
        return handlePerplexityResponse;
      case "deepseek":
        return handleDeepseekResponse;
      default:
        return () => {};
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-app text-fg">
      {/* Background */}
      <div className="bg-grid" />
      <div className="bg-ai-gradient" />

      {/* Main content */}
      <div
        className="relative z-10 flex-1 overflow-y-auto custom-scrollbar"
        style={{
          height: "calc(100vh - 4rem - 4rem)",
          marginTop: "4rem",
          marginBottom: "4rem",
        }}
      >
        <div className="mx-auto max-w-[1400px] px-4 py-4 h-full flex flex-col">
          {/* Model panels grid */}
          <div
            className={`grid gap-4 flex-shrink-0 ${
              fullscreen
                ? "grid-cols-1"
                : models.length === 1
                ? "grid-cols-1"
                : models.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : models.length === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }`}
          >
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
                  onResponse={getResponseHandler(m)}
                  existingResponse={responses[m]}
                />
              </div>
            ))}
          </div>

          {/* Input at bottom */}
          <div className="mt-4 max-w-[800px] mx-auto w-full flex-shrink-0">
            <PromptInput
              placeholder="Ask all selected models..."
              onSubmit={(p) => {
                setIsInitialLoad(true);
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

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#0f1620] border-t border-gray-800 z-50">
        <div className="mx-auto max-w-[1400px] px-4 py-3 text-center text-muted text-sm">
          © 2025 <span className="font-semibold text-white">EchoIntellect</span>
          . All rights reserved.
        </div>
      </footer>
    </div>
  );
}
