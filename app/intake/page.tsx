"use client";
import React from "react";
import QuestionRenderer from "@/components/assistant/QuestionRenderer";
import VoiceMic from "@/components/assistant/VoiceMic";
import GlowFrame from "@/components/assistant/GlowFrame";
import type { IntakeTurn, SessionState } from "@/lib/types";
import { buildQuestionQueue } from "@/lib/intake/engine";
import { QUESTIONS } from "@/lib/intake/questions";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic'

export default function IntakePage() {
  const [session, setSession] = React.useState<SessionState>({
    answers: {}, photos: [], progress: 0, palette_hypotheses: [], constraints: {}
  });
  const [turn, setTurn] = React.useState<IntakeTurn | null>(null);
  const [log, setLog] = React.useState<string[]>([]);
  const [voiceActive, setVoiceActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [revealing, setRevealing] = React.useState(false);
  const [history, setHistory] = React.useState<{ field_id: string; value: any }[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const ask = React.useCallback(async (userMessage: any, saveUnder?: string) => {
    try {
      setLoading(true);
      const normalized = typeof userMessage === "string" && (userMessage === "Not sure" || userMessage === "Skip / I’m not sure") ? null : userMessage;
      if (saveUnder !== undefined) {
        setSession(s => {
          const nextAns = { ...s.answers };
            if (normalized === null) delete nextAns[saveUnder]; else nextAns[saveUnder] = normalized;
          return { ...s, answers: nextAns };
        });
        if (normalized !== null) setHistory((h: { field_id: string; value: any }[]) => [...h, { field_id: saveUnder, value: normalized }]);
      }
      setLog(l => [...l, `You: ${JSON.stringify(userMessage)}`]);
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userMessage, sessionState: { ...session, answers: saveUnder !== undefined ? (normalized === null ? (()=>{ const a={...session.answers}; delete a[saveUnder]; return a; })() : { ...session.answers, [saveUnder]: normalized }) : session.answers } }) });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "Unknown error"); setLog(l => [...l, `Assistant (error): ${data?.error || "Unknown error"}`]); return; }
      setTurn(data as IntakeTurn);
    } catch (e:any) {
      setError(e?.message || "Network error");
      setLog(l => [...l, `Assistant (error): ${e?.message || "Network error"}`]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  React.useEffect(() => {
    if (searchParams.get("resume") === "reveal") return;
    if (!turn) ask("INIT");
  }, [turn, ask, searchParams]);
  const handleReveal = React.useCallback(async (override?: SessionState) => {
    try {
      setError(null);
      setRevealing(true);
      const current = override ?? session;
      const vibe = current.answers?.["desired_vibe"] as string | undefined;
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: "sherwin_williams",
          vibe: vibe || "Custom",
          source: "intake"
        })
      });
      const data = await res.json();
      if (data?.story) {
        try { localStorage.setItem("colrvia:lastStory", JSON.stringify(data.story)); } catch {}
        router.push("/reveal");
        return;
      }
      if (res.status === 401) {
        setRevealing(false);
        try { localStorage.setItem("colrvia_session", JSON.stringify(current)); } catch {}
        router.push(`/sign-in?next=${encodeURIComponent("/intake?resume=reveal")}`);
        return;
      }
      if (!res.ok || !data?.id) {
        setError(data?.error || "Could not create story");
        return;
      }
      router.push(`/reveal/${data.id}`);
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setRevealing(false);
    }
  }, [router, session]);

  React.useEffect(() => {
    if (searchParams.get("resume") !== "reveal") return;
    const stored = localStorage.getItem("colrvia_session");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as SessionState;
      setSession(parsed);
      localStorage.removeItem("colrvia_session");
      handleReveal(parsed);
    } catch {}
  }, [searchParams, handleReveal]);

  function resetAll() {
    try { window.colrviaVoice?.stop(); } catch {}
    setSession({ answers: {}, photos: [], progress: 0, palette_hypotheses: [], constraints: {} });
    setTurn(null); setLog([]); setError(null); setHistory([]); localStorage.removeItem("colrvia_session");
  }
  function goBack() {
    setHistory((h: { field_id: string; value: any }[]) => { const next=[...h]; const last=next.pop(); if(!last) return next; setSession(s=>{ const a={...s.answers}; delete a[last.field_id]; return { ...s, answers:a };}); ask("BACK"); return next; });
  }
  const queue = React.useMemo(() => buildQuestionQueue(session.answers as any), [session.answers]);
  const total = queue.length || 1;
  const answered = queue.filter(id => {
    const field = QUESTIONS[id].field ?? id;
    const val = (session.answers as any)[field];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== null && val !== "";
  }).length;
  const pct = Math.min(100, Math.round(answered/total*100));

  // Speak on each new turn (question) when voice active and turn changes
  const lastSpokenRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!voiceActive) return;
    if (!turn) return;
    // Completion sentinel
    if (turn.field_id === "_complete") {
      if (lastSpokenRef.current !== "__done__") {
        window.colrviaVoice?.speak("Thanks, that's everything I need. You can review or adjust answers and then proceed.");
        lastSpokenRef.current = "__done__";
      }
      return;
    }
    if (turn.field_id && lastSpokenRef.current !== turn.field_id) {
      const q = (turn as any).next_question || ""; // property defined on IntakeTurn
      if (q) window.colrviaVoice?.speak(q);
      lastSpokenRef.current = turn.field_id;
    }
  }, [turn, voiceActive]);

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
            <VoiceMic onActiveChange={setVoiceActive} greet="Hi—I'll ask a few quick questions to understand your needs. Ready when you are." />
          </div>
        </div>
  {loading && <div className="text-xs text-neutral-500">Thinking…</div>}
  {revealing && <div className="text-xs text-neutral-500">Generating palette…</div>}
  {error && <div className="text-xs text-red-600">{error}</div>}
  <QuestionRenderer
    turn={turn}
    onAnswer={(ans)=>{ if(!turn) return; ask(ans, turn.field_id); }}
    onComplete={handleReveal}
    completeBusy={revealing}
  />
        {log.length > 0 && (
          <details className="mt-6 text-xs text-neutral-500">
            <summary className="cursor-pointer select-none">Log</summary>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              {log.slice(-50).map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </details>
        )}
      </main>
    </>
  );
}
