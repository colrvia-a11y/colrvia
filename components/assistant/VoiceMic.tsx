"use client";
import React from "react";

type Props = { onActiveChange?: (active: boolean) => void };

export default function VoiceMic({ onActiveChange }: Props) {
  const [active, setActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const pcRef = React.useRef<RTCPeerConnection | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const tokenRes = await fetch("/api/realtime/session", { method: "POST" });
      const data = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(data?.error || "Could not create realtime session");

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // play remote audio
      const audioEl = new Audio();
      audioEl.autoplay = true;
      audioRef.current = audioEl;
      pc.ontrack = (e) => { audioEl.srcObject = e.streams[0]; };

      // add mic
      const sender = pc.addTrack(stream.getTracks()[0], new MediaStream([stream.getTracks()[0]]));

      // data channel optional
      pc.addTransceiver("audio");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const r = await fetch(data.client_secret?.value || data.client_secret || data?.url || "", {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      }).catch(() => null);

      if (!r || !r.ok) {
        throw new Error("Failed to start realtime call");
      }
      const answer = await r.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answer });

      setActive(true);
      onActiveChange?.(true);
    } catch (e:any) {
      setError(e.message || "Mic error");
      setActive(false);
      onActiveChange?.(false);
    }
  }

  function stop() {
    pcRef.current?.getSenders().forEach(s => { try { (s.track as MediaStreamTrack)?.stop(); } catch {} });
    pcRef.current?.close();
    pcRef.current = null;
    setActive(false);
    onActiveChange?.(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={active ? stop : start}
        className={`px-4 py-2 rounded-full border ${active ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white/70 dark:bg-neutral-900/70"}`}
        aria-pressed={active}>
        {active ? "Stop voice" : "Talk to designer"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
      <span className="text-xs text-neutral-500">{active ? "Listening…" : "Tap to speak"}</span>
    </div>
  );
}
