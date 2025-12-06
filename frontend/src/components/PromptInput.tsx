"use client";

import { useState, useRef, useEffect } from "react";

export default function PromptInput({
  placeholder = "Ask anything...",
  onSubmit,
  autoFocus = false,
  disabled = false,
  maxHeight = 200,
}: {
  placeholder?: string;
  onSubmit: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  maxHeight?: number;
}) {
  const [val, setVal] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [val, maxHeight]);

  // Only autofocus if user has interacted OR if explicitly set on desktop
  useEffect(() => {
    if (autoFocus && hasInteracted && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus, hasInteracted]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!val.trim()) return;
        onSubmit(val.trim());
        setVal("");
      }}
      className="relative flex items-center gap-2"
    >
      <textarea
        ref={textareaRef}
        className="input pr-2 resize-none custom-scrollbar flex-1"
        style={{
          minHeight: "48px",
          maxHeight: `${maxHeight}px`,
          overflowY: "auto",
        }}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        onFocus={() => setHasInteracted(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (val.trim()) {
              onSubmit(val.trim());
              setVal("");
            }
          }
        }}
      />
      <button
        type="submit"
        disabled={disabled}
        className="btn btn-primary self-end mb-[2px] px-6 py-2.5"
        style={{ height: "44px" }}
      >
        Send
      </button>
    </form>
  );
}
