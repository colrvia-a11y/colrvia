"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useOnboardingFlow from "@/lib/hooks/useOnboardingFlow";
import { moss } from "@/lib/ai/phrasing";
import { QUESTION_SECTIONS } from "@/lib/ai/sections";

export default function InterviewPage() {
  const router = useRouter();
  const { state, currentQ, sendAnswer, done } = useOnboardingFlow();
  const [input, setInput] = useState("");

  useEffect(() => {
    if (done) router.push("/start/processing");
  }, [done, router]);

  if (!currentQ) {
    return <main className="p-8">{moss.greet()}</main>;
  }

  const answeredKeys = Object.keys(state?.answers || {});
  const sectionTotals = Object.entries(QUESTION_SECTIONS).reduce(
    (acc, [id, sec]) => {
      acc[sec] = (acc[sec] || 0) + 1;
      return acc;
    },
    { style: 0, room: 0 } as Record<string, number>
  );
  const answeredCounts = answeredKeys.reduce(
    (acc, k) => {
      const sec = (QUESTION_SECTIONS as any)[k];
      if (sec) acc[sec] = (acc[sec] || 0) + 1;
      return acc;
    },
    { style: 0, room: 0 } as Record<string, number>
  );
  const currentSection = (QUESTION_SECTIONS as any)[currentQ.key] as "style" | "room";
  const label = moss.progressLabel(
    currentSection,
    (answeredCounts as any)[currentSection] + 1,
    (sectionTotals as any)[currentSection]
  );

  async function submit() {
    if (!input) return;
    const val = input;
    setInput("");
    await sendAnswer(val);
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <p className="text-sm text-muted-foreground">{moss.greet()}</p>
      <div>
        <p className="mb-2">{moss.ask(currentQ.prompt)}</p>
        {Array.isArray(currentQ.options) && currentQ.options.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {currentQ.options.map((o) => (
              <button
                key={o}
                type="button"
                className="chip"
                onClick={() => sendAnswer(o)}
              >
                {o}
              </button>
            ))}
          </div>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={moss.typingHint()}
          className="w-full rounded border px-3 py-2"
        />
        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={submit}
          disabled={!input}
        >
          Send
        </button>
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </main>
  );
}
