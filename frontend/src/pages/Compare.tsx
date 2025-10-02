"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import ModelPanel from "../components/ModelPanel";
import type { ModelKey } from "../utils/api";
import PromptInput from "../components/PromptInput";
import { computeUniqueSentences, type ModelResponses } from "../utils/diff";

export default function Compare() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const prompt = params.get("prompt") || "";
  const models = (params.get("models") || "")
    .split(",")
    .filter(Boolean) as ModelKey[];
  const [responses, setResponses] = useState<ModelResponses>({
    gpt: undefined,
    gemini: undefined,
    perplexity: undefined,
    deepseek: undefined,
  });
  const [fullscreen, setFullscreen] = useState<ModelKey | null>(null);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      nav(
        `/login?next=${encodeURIComponent(location.pathname + location.search)}`
      );
      return;
    }
    if (!prompt || models.length === 0) nav("/");
  }, [prompt, models, nav]);

  function setResp(model: ModelKey, text: string) {
    setResponses((prev) => ({ ...prev, [model]: text }));
  }

  const allDone = useMemo(
    () => models.every((m) => (responses as any)[m]),
    [models, responses]
  );

  const diffs = useMemo(() => {
    if (!allDone) return null;
    const { sentences, uniqueIndices } = computeUniqueSentences(responses);
    // convert unique sentences to highlighted HTML per model
    const markup: Partial<Record<ModelKey, string>> = {};
    for (const m of models) {
      const arr = sentences[m] || [];
      const uniq = uniqueIndices[m] || new Set<number>();
      const html = arr
        .map((s, i) =>
          uniq.has(i)
            ? `<mark class="${
                m === "gpt"
                  ? "mark-red"
                  : m === "gemini"
                  ? "mark-blue"
                  : m === "perplexity"
                  ? "mark-green"
                  : "mark-yellow"
              }">${escapeHtml(s)}</mark>`
            : escapeHtml(s)
        )
        .join(" ");
      markup[m] = html;
    }
    return markup;
  }, [allDone, models, responses]);

  function escapeHtml(s: string) {
    return s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c] as string)
    );
  }

  const gridCls = fullscreen
    ? "grid-cols-1"
    : models.length === 1
    ? "grid-cols-1"
    : models.length === 2
    ? "grid-cols-1 sm:grid-cols-2"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  const panels = models.map((m) => (
    <div key={m} className={fullscreen && fullscreen !== m ? "hidden" : ""}>
      <ModelPanel
        model={m}
        initialPrompt={prompt}
        onHeaderClick={() => setFullscreen((fs) => (fs === m ? null : m))}
        onResponse={(t) => setResp(m, t)}
        highlightMarkup={highlight && diffs ? diffs[m] || null : null}
      />
    </div>
  ));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Comparing: {models.map((m) => m.toUpperCase()).join(" • ")}
        </h2>
        <div className="flex items-center gap-2">
          {allDone && (
            <button
              className="btn btn-ghost"
              onClick={() => setHighlight((h) => !h)}
            >
              {highlight ? "Hide differences" : "Highlight differences"}
            </button>
          )}
          {fullscreen && (
            <button
              className="btn btn-ghost"
              onClick={() => setFullscreen(null)}
            >
              Back
            </button>
          )}
        </div>
      </div>
      <div className={`grid ${gridCls} gap-4`}>{panels}</div>
      {/* Universal prompt bar */}
      <div className="sticky bottom-4">
        <PromptInput
          placeholder="Ask all selected models..."
          onSubmit={(p) => {
            // reload compare with new prompt, same models
            location.assign(
              `/compare?prompt=${encodeURIComponent(p)}&models=${models.join(
                ","
              )}`
            );
          }}
        />
      </div>
    </div>
  );
}
