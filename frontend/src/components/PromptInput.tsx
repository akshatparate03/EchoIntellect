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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [val, maxHeight]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!val.trim()) return;
        onSubmit(val.trim());
        setVal("");
      }}
      className="relative"
    >
      <textarea
        ref={textareaRef}
        className="input pr-32 resize-none custom-scrollbar"
        style={{
          minHeight: "48px",
          maxHeight: `${maxHeight}px`,
          overflowY: "auto",
        }}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        rows={1}
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
        className="btn btn-primary absolute right-2 bottom-2"
      >
        Send
      </button>
    </form>
  );
}
