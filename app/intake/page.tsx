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
            "use client";
            import React from "react";
            import QuestionRenderer from "@/components/assistant/QuestionRenderer";
            import VoiceMic from "@/components/assistant/VoiceMic";
            import GlowFrame from "@/components/assistant/GlowFrame";
            import type { IntakeTurn, SessionState } from "@/lib/types";
            import { countAllFields } from "@/lib/engine";

            export default function IntakePage() {
              const [session, setSession] = React.useState<SessionState>({
                answers: {}, photos: [], progress: 0, palette_hypotheses: [], constraints: {}
              });
              const [turn, setTurn] = React.useState<IntakeTurn | null>(null);
              const [log, setLog] = React.useState<string[]>([]);
              const [voiceActive, setVoiceActive] = React.useState(false);
              const [loading, setLoading] = React.useState(false);
              const [error, setError] = React.useState<string | null>(null);
              const [history, setHistory] = React.useState<{ field_id: string; value: any }[]>([]);

              // Persist in localStorage for mobile refreshes
              React.useEffect(() => {
                const raw = localStorage.getItem("colrvia_session");
                if (raw) {
                  try { setSession(JSON.parse(raw)); } catch {}
                }
              }, []);
              React.useEffect(() => {
                localStorage.setItem("colrvia_session", JSON.stringify(session));
              }, [session]);

              const ask = React.useCallback(async (userMessage: string, saveUnder?: string) => {
                try {
                  setError(null);
                  setLoading(true);

                  const normalized =
                    userMessage === "Not sure" || userMessage === "Skip / I’m not sure" ? null : userMessage;

                  if (saveUnder !== undefined) {
                    setSession(s => {
                      const nextAns = { ...s.answers };
                      if (normalized === null) delete nextAns[saveUnder];
                      else nextAns[saveUnder] = normalized;
                      return { ...s, answers: nextAns };
                    });
                    if (normalized !== null) {
                      setHistory(h => [...h, { field_id: saveUnder, value: normalized }]);
                    }
                  }

                  setLog(l => [...l, `You: ${userMessage}`]);

                  const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userMessage,
                      sessionState: {
                        ...session,
                        answers:
                          saveUnder !== undefined
                            ? (userMessage === "Not sure" || userMessage === "Skip / I’m not sure"
                                ? (() => { const a = { ...session.answers }; delete a[saveUnder]; return a; })()
                                : { ...session.answers, [saveUnder]: userMessage })
                            : session.answers
                      }
                    })
                  });

                  const data = await res.json();
                  if (!res.ok) {
                    setError(data?.error || "Unknown error");
                    setLog(l => [...l, `Assistant (error): ${data?.error || "Unknown error"}`]);
                    return;
                  }
                  setTurn(data as IntakeTurn);
                } catch (e:any) {
                  setError(e?.message || "Network error");
                  setLog(l => [...l, `Assistant (error): ${e?.message || "Network error"}`]);
                } finally {
                  setLoading(false);
                }
              }, [session, turn]);

              // Kickoff
              React.useEffect(() => { if (!turn) ask("INIT"); }, [turn, ask]);

              function resetAll() {
                setSession({ answers: {}, photos: [], progress: 0, palette_hypotheses: [], constraints: {} });
                setTurn(null);
                setLog([]);
                setError(null);
                setHistory([]);
                localStorage.removeItem("colrvia_session");
              }

              function goBack() {
                setHistory(h => {
                  const next = [...h];
                  const last = next.pop();
                  if (!last) return next;
                  setSession(s => {
                    const a = { ...s.answers };
                    delete a[last.field_id];
                    return { ...s, answers: a };
                  });
                  // re-ask with updated state
                  ask("BACK");
                  return next;
                });
              }

              const total = countAllFields(session) || 1;
              const answered = Object.keys(session.answers || {}).length;
              const pct = Math.min(100, Math.round((answered / total) * 100));

              return (
                <>
                  <GlowFrame active={voiceActive} />
                  <main className="relative mx-auto max-w-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h1 className="text-2xl font-semibold">Colrvia Intake</h1>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-neutral-600">{pct}% complete</div>
                        <button className="text-sm underline" onClick={goBack} disabled={!history.length}>Back</button>
                        <button className="text-sm underline" onClick={resetAll}>Start over</button>
                        <VoiceMic onActiveChange={setVoiceActive} />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg border border-red-300 bg-red-50 text-sm text-red-800">
                        {error}
                        <div classN
