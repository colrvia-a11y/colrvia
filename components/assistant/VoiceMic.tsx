"use client";
import React from "react";

type Props = { onActiveChange?: (active: boolean) => void };

export default function VoiceMic({ onActiveChange }: Props) {
  const [active, setActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const pcRef = React.useRef<RTCPeerConnection | null>(null);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
        iceTransportPolicy: "all",
      });
      pcRef.current = pc;

      // Remote audio
      const audioEl = new Audio();
      audioEl.autoplay = true;
      pc.ontrack = (e) => { audioEl.srcObject = e.streams[0]; };

      // Send mic / receive back
      pc.addTrack(stream.getTracks()[0], stream);
      pc.addTransceiver("audio", { direction: "sendrecv" });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE to gather
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") return resolve();
        const check = () => {
          if (pc.iceGatheringState === "complete") {
            pc.removeEventListener("icegatheringstatechange", check);
            resolve();
          }
        };
        pc.addEventListener("icegatheringstatechange", check);
        setTimeout(resolve, 1200);
      });

      // Send to our server relay
      const res = await fetch("/api/realtime/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: pc.localDescription?.sdp || "",
          model: undefined, // use server default
        }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to start realtime call");
      const answerSDP = await res.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });

      setActive(true);
      onActiveChange?.(true);
    } catch (e: any) {
      setError(e?.message || "Mic error");
      setActive(false);
      onActiveChange?.(false);
    }
  }

  function stop() {
    try {
      pcRef.current?.getSenders().forEach((s) => (s.track as MediaStreamTrack | undefined)?.stop());
      pcRef.current?.close();
    } catch {}
    pcRef.current = null;
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
      {error && <span className="text-xs text-red-500">{error}</span>}
      <span className="text-xs text-neutral-500">{active ? "Listening…" : "Tap to speak"}</span>
    </div>
  );
}
