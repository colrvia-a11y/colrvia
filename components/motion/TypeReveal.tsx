"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * TypeReveal — accessible typewriter effect that respects prefers-reduced-motion.
 * - Renders instantly for reduced motion.
 * - Uses aria-live="polite" to announce once without spamming SRs.
 */
export default function TypeReveal({
  text,
  as: Tag = "p",
  className,
  speed = 22,        // ms per character
  delay = 160,       // initial delay
  showCaret = true,  // blinking caret while typing
}: {
  text: string;
  as?: any;
  className?: string;
  speed?: number;
  delay?: number;
  showCaret?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState<string>(reduced ? text : "");
  const doneRef = useRef<boolean>(reduced);

  useEffect(() => {
    if (reduced) return;

    let i = 0;
    const start = window.setTimeout(function tick() {
      const id = window.setInterval(() => {
        i++;
        setOut(text.slice(0, i));
        if (i >= text.length) {
          window.clearInterval(id);
          doneRef.current = true;
        }
      }, speed);
    }, delay);

    return () => window.clearTimeout(start);
  }, [text, speed, delay, reduced]);

  const caret = useMemo(() => {
    if (!showCaret) return null;
    return (
      <span
        aria-hidden
        className={`inline-block align-baseline translate-y-[1px] w-[1px] h-[1em] ml-[2px] bg-current ${
          doneRef.current ? "opacity-0" : "type-caret"
        }`}
      />
    );
  }, [showCaret]);

  return (
    <Tag className={className} aria-live="polite">
      {out}
      {caret}
      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          .type-caret { animation: caret-blink 1s steps(1, end) infinite; }
          @keyframes caret-blink { 0%, 45% { opacity: 1; } 50%, 100% { opacity: 0; } }
        }
      `}</style>
    </Tag>
  );
}

/* tiny hook */
function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefers(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return prefers;
}
