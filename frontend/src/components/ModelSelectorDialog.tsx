"use client";

import { useState } from "react";
import type { ModelKey } from "../utils/api";

const ALL: { key: ModelKey; label: string }[] = [
  { key: "gpt", label: "GPT" },
  { key: "gemini", label: "Gemini" },
  { key: "perplexity", label: "Perplexity" },
  { key: "deepseek", label: "DeepSeek" },
];

export default function ModelSelectorDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (models: ModelKey[]) => void;
}) {
  const [selected, setSelected] = useState<ModelKey[]>([]);

  function toggle(k: ModelKey) {
    setSelected((prev) =>
      prev.includes(k)
        ? prev.filter((x) => x !== k)
        : prev.length < 4
        ? [...prev, k]
        : prev
    );
  }

  function toggleSelectAll() {
    if (selected.length === ALL.length) {
      setSelected([]);
    } else {
      setSelected(ALL.map((m) => m.key));
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-panel border border-panel rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Choose up to 4 models</h3>
        <p className="text-sm text-muted mb-4">
          Selection order will define column order.
        </p>

        <div className="mb-4">
          <button
            onClick={toggleSelectAll}
            className="w-full px-3 py-2 rounded border border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium text-sm hover:bg-[var(--color-primary)]/20 transition-colors"
          >
            {selected.length === ALL.length ? "Deselect All" : "Select All"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ALL.map((m) => (
            <button
              key={m.key}
              onClick={() => toggle(m.key)}
              className={`px-3 py-2 rounded border ${
                selected.includes(m.key)
                  ? "border-[var(--color-primary)]"
                  : "border-panel"
              } text-left`}
            >
              <div className="font-medium">{m.label}</div>
              <div className="text-xs text-muted">{m.key}</div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 mt-4">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (selected.length > 0) onConfirm(selected);
            }}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
