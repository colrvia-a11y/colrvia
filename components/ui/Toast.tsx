"use client";
import { useEffect, useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  function show(message: string, ms = 1800) {
    setMsg(message);
    setTimeout(() => setMsg(null), ms);
  }
  const ToastEl = msg ? (
    <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full border px-4 py-2 text-sm bg-white/90 dark:bg-neutral-900/90 backdrop-blur">
      {msg}
    </div>
  ) : null;
  return { show, ToastEl };
}
