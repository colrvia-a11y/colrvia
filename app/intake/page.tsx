"use client";
import React from "react";
import QuestionRenderer from "@/components/assistant/QuestionRenderer";
import VoiceMic from "@/components/assistant/VoiceMic";
import GlowFrame from "@/components/assistant/GlowFrame";
import type { IntakeTurn, SessionState } from "@/lib/types";

export default function IntakePage() {
  const [session, setSession] = React.useState<SessionState>({
    answers: {}, photos: [], progress: 0, palette_hypotheses: [], constraints: {}
  });
  const [turn, setTurn] = React.useState<IntakeTurn | null>(null);
  const [log, setLog] = React.useState<string[]>([]);
  const [voiceActive, setVoiceActive] = React.useState(false);

  const ask = async (userMessage: string, saveUnder?: string) => {
    // Save the user's answer locally first if we know the field
    if (saveUnder && userMessage !== undefined) {
      setSession(s => ({ ...s, answers: { ...s.answers, [saveUnder]: userMessage } }));
    }
    setLog(l => [...l, `You: ${userMessage}`]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage, sessionState: { ...session, answers: saveUnder ? { ...session.answers, [saveUnder]: userMessage } : session.answers } })
    });

    const data = await res.json();
    if (!res.ok) {
      setLog(l => [...l, `Assistant (error): ${data?.error || "Unknown error"}`]);
      return;
    }
    setTurn(data as IntakeTurn);
  };

  React.useEffect(() => { if (!turn) ask("Let's start the intake."); }, [turn]);

  return (
    <>
      <GlowFrame active={voiceActive} />
      <main className="relative mx-auto max-w-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Colrvia Intake</h1>
          <VoiceMic onActiveChange={setVoiceActive} />
        </div>
        <QuestionRenderer
          turn={turn}
          onAnswer={(ans) => {
            if (!turn) return;
            ask(ans, turn.field_id);
          }}
        />
        <div className="text-xs text-neutral-500 whitespace-pre-wrap">{log.slice(-6).join("\n")}</div>
      </main>
    </>
  );
}
