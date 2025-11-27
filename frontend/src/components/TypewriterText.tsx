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
  const textRef = useRef(text);

  // ✅ FIXED: If text hasn't changed, don't re-animate
  useEffect(() => {
    // If text is the same as before, just display it instantly
    if (text === textRef.current && output === text) {
      return;
    }

    // New text detected - reset and animate
    textRef.current = text;
    setOutput("");
    indexRef.current = 0;
    isDoneRef.current = false;

    const id = setInterval(() => {
      if (isDoneRef.current) {
        return;
      }

      const currentIndex = indexRef.current;

      if (currentIndex >= text.length) {
        isDoneRef.current = true;
        clearInterval(id);
        onDone?.();
        return;
      }

      const char = text[currentIndex];
      if (char !== undefined) {
        setOutput((prev) => prev + char);
      }

      indexRef.current++;

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
