"use client";
import React from "react";
import type { IntakeTurn } from "@/lib/types";

type Props = {
  turn: IntakeTurn | null;
  onAnswer: (answer: string) => void;
  onComplete?: () => void;
};

export default function QuestionRenderer({ turn, onAnswer, onComplete }: Props) {
  const [text, setText] = React.useState("");

  if (!turn) return null;

  if (turn.field_id === "_complete") {
    return (
      <div className="p-4 rounded-2xl border bg-white/70 dark:bg-neutral-900/70 text-center">
        <div className="text-lg font-medium">{turn.next_question}</div>
        <button
          className="px-3 py-2 rounded-lg border mt-3"
          onClick={() => onComplete && onComplete()}
        >
          Reveal My Palette
        </button>
      </div>
    );
  }

  const send = (val: string) => {
    onAnswer(val);
    setText("");
  };

  const renderControls = () => {
    switch (turn.input_type) {
      case "singleSelect":
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            {turn.choices?.map((c) => (
              <button key={c} className="px-3 py-2 rounded-lg border" onClick={() => send(c)}>
                {c}
              </button>
            ))}
            <button className="px-3 py-2 rounded-lg border opacity-80" onClick={() => send("Not sure")}>
              I’m not sure
            </button>
          </div>
        );
      case "yesNo":
        return (
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-2 rounded-lg border" onClick={() => send("Yes")}>Yes</button>
            <button className="px-3 py-2 rounded-lg border" onClick={() => send("No")}>No</button>
            <button className="px-3 py-2 rounded-lg border opacity-80" onClick={() => send("Not sure")}>I’m not sure</button>
          </div>
        );
      case "slider":
        return (
          <div className="mt-3">
            <input
              type="range"
              min={turn.validation?.min ?? 0}
              max={turn.validation?.max ?? 5}
              step={1}
              defaultValue={Math.round(((turn.validation?.min ?? 0) + (turn.validation?.max ?? 5)) / 2)}
              onChange={(e) => setText(e.target.value)}
              className="w-full"
            />
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-2 rounded-lg border" onClick={() => send(text || String(turn.validation?.min ?? 0))}>Continue</button>
              <button className="px-3 py-2 rounded-lg border opacity-80" onClick={() => send("Not sure")}>Skip / I’m not sure</button>
            </div>
          </div>
        );
      default:
        return (
          <form
            className="flex gap-2 mt-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) send(text.trim());
              else send("Not sure");
            }}
          >
            <input
              autoFocus
              className="flex-1 px-3 py-2 rounded-lg border"
              placeholder="Type your answer…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="px-3 py-2 rounded-lg border" type="submit">Send</button>
            <button type="button" className="px-3 py-2 rounded-lg border opacity-80" onClick={() => send("Not sure")}>I’m not sure</button>
          </form>
        );
    }
  };

  return (
    <div className="p-4 rounded-2xl border bg-white/70 dark:bg-neutral-900/70">
      <div className="text-lg font-medium">{turn.next_question}</div>
      {turn.explain_why && <div className="text-sm text-neutral-600 mt-1">{turn.explain_why}</div>}
      {renderControls()}
    </div>
  );
}
