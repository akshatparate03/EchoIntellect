"use client";

import { useState } from "react";

export default function PromptInput({
  placeholder = "Ask anything...",
  onSubmit,
  autoFocus = false,
  disabled = false,
}: {
  placeholder?: string;
  onSubmit: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  const [val, setVal] = useState("");
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
      <input
        className="input pr-28"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled}
        className="btn btn-primary absolute right-2 top-1/2 -translate-y-1/2"
      >
        Send
      </button>
    </form>
  );
}
