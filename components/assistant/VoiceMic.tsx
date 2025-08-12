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

      // Get ephemeral client secret for Realtime
      const tokenRes = await fetch("/api/realtime/session", { method: "POST" });
      const session = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(session?.error || "Could not create realtime session");

      const token = session?.client_secret?.value;
      const model = session?.model || "gpt-4o-realtime-preview-2024-12-17";
      if (!token) throw new Error("Missing realtime client token");

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Play remote audio
      const audioEl = new Audio();
      audioEl.autoplay = true;
      pc.ontrack = (e) => { audioEl.srcObject = e.streams[0]; };

      // Send mic
      pc.addTrack(stream.getTracks()[0], stream);
      // Receive audio back
      pc.addTransceiver("audio", { direction: "sendrecv" });

      // Gather ICE before sending offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === "complete") return resolve();
        const check = () => {
          if (pc.iceGatheringState === "complete") {
            pc.removeEventListener("icegatheringstatechange", check);
            resolve();
          }
        };
        pc.addEventListener("icegatheringstatechange", check);
        setTimeout(resolve, 1000); // safety timeout
      });

      // Send SDP offer to OpenAI Realtime endpoint WITH Authorization header
      const endpoint = `https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`;
      const r = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp",
        },
        body: pc.localDescription?.sdp || "",
      });
      if (!r.ok) throw new Error("Failed to start realtime call");
      const answerSDP = await r.text();
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
