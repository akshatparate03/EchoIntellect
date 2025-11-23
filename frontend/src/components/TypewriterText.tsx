"use client";

import { useEffect, useState, useRef } from "react";

export default function TypewriterText({
  text,
  speed = 18,
  onDone,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
}) {
  const [output, setOutput] = useState("");
  const indexRef = useRef(0);
  const isDoneRef = useRef(false);

  useEffect(() => {
    // Reset on new text
    setOutput("");
    indexRef.current = 0;
    isDoneRef.current = false;

    const id = setInterval(() => {
      if (isDoneRef.current) {
        return;
      }

      const currentIndex = indexRef.current;

      // FIXED: Check bounds BEFORE accessing text[i]
      if (currentIndex >= text.length) {
        isDoneRef.current = true;
        clearInterval(id);
        onDone?.();
        return;
      }

      const char = text[currentIndex];
      // Only append if char exists (now it always will)
      if (char !== undefined) {
        setOutput((prev) => prev + char);
      }

      indexRef.current++;

      // Check again after increment
      if (indexRef.current >= text.length) {
        isDoneRef.current = true;
        clearInterval(id);
        onDone?.();
      }
    }, Math.max(5, speed));

    return () => {
      clearInterval(id);
      isDoneRef.current = true;
    };
  }, [text, speed, onDone]);

  return <div className="whitespace-pre-wrap leading-relaxed">{output}</div>;
}
