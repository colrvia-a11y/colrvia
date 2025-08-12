"use client";
import React from "react";
import type { IntakeTurn } from "@/lib/types";

export default function QuestionRenderer({ turn, onAnswer }: { turn: IntakeTurn | null; onAnswer: (answer: string) => void }) {
  if (!turn) return <div className="text-sm text-neutral-500">Loading intake…</div>;
  const { next_question, input_type, choices } = turn;
  const showChoices = (input_type === 'singleSelect' || input_type === 'yesNo' || input_type === 'multiSelect') && choices && choices.length;
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-md border bg-white/60 dark:bg-neutral-900/40">
        <div className="font-medium mb-2">{next_question || "Question"}</div>
        {showChoices ? (
          <div className="flex flex-wrap gap-2">
            {choices!.map((opt, i) => (
              <button
                key={i}
                onClick={() => onAnswer(opt)}
                className="px-3 py-1 rounded-full border text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); const v = fd.get('answer') as string; if (v) onAnswer(v); e.currentTarget.reset(); }}>
            <input
              name="answer"
              className="w-full rounded-md border px-3 py-2 text-sm bg-white/70 dark:bg-neutral-900/70"
              placeholder="Type your answer"
            />
          </form>
        )}
      </div>
    </div>
  );
}
