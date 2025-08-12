"use client";
import React from "react";

type Props = {
  onActiveChange?: (active: boolean) => void;
};

export default function VoiceMic({ onActiveChange }: Props) {
  const [active, setActive] = React.useState(false);
  const [permission, setPermission] = React.useState<"unknown"|"granted"|"denied">("unknown");
  const mediaRef = React.useRef<MediaStream|null>(null);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = stream;
      setPermission("granted");
      setActive(true);
      onActiveChange?.(true);

      // Optional: call our session endpoint now (full Realtime hookup comes in Step 5)
      fetch("/api/realtime/session", { method: "POST" }).catch(() => {});
    } catch (e) {
      setPermission("denied");
      setActive(false);
      onActiveChange?.(false);
    }
  }

  function stop() {
    mediaRef.current?.getTracks().forEach(t => t.stop());
    mediaRef.current = null;
    setActive(false);
    onActiveChange?.(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={active ? stop : start}
        className={`px-4 py-2 rounded-full border ${active ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white/70 dark:bg-neutral-900/70"}`}
        aria-pressed={active}
      >
        {active ? "Stop voice" : "Talk to designer"}
      </button>
      <span className="text-xs text-neutral-500">
        {permission === "denied" ? "Mic blocked—allow in browser settings." : active ? "Listening…" : "Tap to speak"}
      </span>
    </div>
  );
}
