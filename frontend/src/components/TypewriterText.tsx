"use client";

import { useEffect, useState } from "react";

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
  useEffect(() => {
    setOutput("");
    let i = 0;
    const id = setInterval(() => {
      setOutput((prev) => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, Math.max(5, speed));
    return () => clearInterval(id);
  }, [text, speed, onDone]);
  return <div className="whitespace-pre-wrap leading-relaxed">{output}</div>;
}
