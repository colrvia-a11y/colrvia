"use client";
import React from "react";

type Props = { onActiveChange?: (active: boolean) => void; greet?: string | null };

declare global {
  interface Window {
    colrviaVoice?: {
      speak: (text: string) => void;
      stop: () => void;
      active: () => boolean;
    };
  }
}

export default function VoiceMic({ onActiveChange, greet }: Props) {
  const [active, setActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const pcRef = React.useRef<RTCPeerConnection | null>(null);
  const dcRef = React.useRef<RTCDataChannel | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  function exposeBus() {
    window.colrviaVoice = {
      speak: (text: string) => {
        const dc = dcRef.current;
        if (!dc || dc.readyState !== "open") return;
        const payload = {
          type: "response.create",
          response: {
            modalities: ["audio"],
            // We use 'instructions' as the speech body per Realtime docs
            instructions: text,
          },
        };
        dc.send(JSON.stringify(payload));
      },
      stop: () => {
        try {
          pcRef.current?.getSenders().forEach((s) => (s.track as MediaStreamTrack | undefined)?.stop());
          pcRef.current?.close();
        } catch {}
        pcRef.current = null;
        setActive(false);
        onActiveChange?.(false);
      },
      active: () => active,
    };
  }

  async function start() {
    setError(null);
    try {
      const tokenRes = await fetch("/api/realtime/session", { method: "POST" });
      if (!tokenRes.ok) throw new Error((await tokenRes.text()) || "Failed to init session");
      const tokenData = await tokenRes.json();
      const clientSecret = tokenData?.client_secret?.value;
      if (!clientSecret) throw new Error("Missing session token");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
        iceTransportPolicy: "all",
      });
      pcRef.current = pc;

      // Receive remote audio and play it
      try {
        pc.addTransceiver("audio", { direction: "recvonly" });
      } catch {}
      pc.ontrack = (e) => {
        const remote = e.streams?.[0];
        if (audioRef.current && remote) {
          audioRef.current.srcObject = remote;
          audioRef.current.play().catch(() => {});
        }
      };

      // Send mic upstream
      const micTrack = stream.getTracks()[0];
      if (micTrack) pc.addTrack(micTrack, stream);

      // Data channel for Realtime events
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      dc.onopen = () => {
        exposeBus();
        if (greet) {
          window.colrviaVoice?.speak(greet);
        }
      };

      const offer = await pc.createOffer({ offerToReceiveAudio: true });
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

      // Use our server relay to start the Realtime call
      const res = await fetch("/api/realtime/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdp: pc.localDescription?.sdp || "", token: clientSecret }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to start realtime call");
      const answerSDP = await res.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });

      setActive(true);
      onActiveChange?.(true);
      exposeBus();
      setTimeout(() => audioRef.current?.play().catch(() => {}), 0);
    } catch (e: any) {
      setError(e?.message || "Mic error");
      setActive(false);
      onActiveChange?.(false);
    }
  }

  function stop() {
    window.colrviaVoice?.stop();
  }

  return (
    <div className="flex items-center gap-3" aria-busy={active || undefined}>
      <button
        type="button"
        onClick={active ? stop : start}
        className={`px-4 py-2 rounded-full border transition-transform motion-reduce:transition-none hover:scale-105 active:scale-95 ${active ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white/70 dark:bg-neutral-900/70"}`}
        aria-pressed={active}
        aria-keyshortcuts="Shift+M"
      >
        {active ? "Stop voice" : "Talk to designer"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
      <span className="text-xs text-neutral-500">{active ? "Listening…" : "Tap to speak"}</span>
      {/* Hidden audio element for remote voice */}
      <audio ref={audioRef} autoPlay playsInline className="hidden" />
    </div>
  );
}
