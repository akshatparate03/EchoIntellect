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
  const intervalIdRef = useRef<number | null>(null);
  const textRef = useRef("");
  const onDoneRef = useRef(onDone);

  // Update onDone ref without triggering re-render
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // Clear any existing interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    // If same text as before, skip animation
    if (text === textRef.current && output === text) {
      return;
    }

    // Update text ref
    textRef.current = text;

    // Reset output
    setOutput("");

    if (!text) return;

    let index = 0;

    intervalIdRef.current = window.setInterval(() => {
      if (index >= text.length) {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
        // Call onDone from ref
        onDoneRef.current?.();
        return;
      }

      setOutput(text.substring(0, index + 1));
      index++;
    }, Math.max(5, speed));

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [text, speed]); // Only text and speed in dependency

  return <div className="whitespace-pre-wrap leading-relaxed">{output}</div>;
}
