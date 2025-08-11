"use client";
import { useRef } from 'react';

export function useEventTimer() {
  const t0 = useRef<number | null>(null);
  const last = useRef<number>(0);
  function start() { t0.current = Date.now(); last.current = 0; }
  function stop() { const now = Date.now(); const ms = t0.current ? Math.max(0, now - t0.current) : 0; last.current = ms; t0.current = null; return ms; }
  function peek() { return t0.current ? Math.max(0, Date.now() - t0.current) : last.current; }
  return { start, stop, peek };
}
