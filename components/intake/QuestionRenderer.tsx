"use client";
import React from "react";
import type { Question } from "@/lib/intake/questions";
import type { QuestionId } from "@/lib/intake/types";
import { track } from "@/lib/analytics";
import { Chip, Input, Button } from "@/components/ui";
import { Upload } from "@/components/upload";

const SKIP_DEFAULTS: Partial<Record<QuestionId, any>> = {
  window_aspect: "unknown",
  dark_stance: "open",
  mood_words: ["unsure"],
  avoid_colors: ["unsure"],
  k_fixed_details: "unsure",
  b_fixed_details: "unsure",
  l_fixed_details: "unsure",
  n_theme_keepers: "unsure",
  h_adjacent_color: ["unsure"],
  o_coordination_preference: "Not sure",
};

type Props = {
  question: Question;
  onAnswer: (value: any) => void;
  onUpload?: (url: string) => void;
};

export default function QuestionRenderer({ question, onAnswer, onUpload }: Props) {
  const [text, setText] = React.useState("" );
  const [multi, setMulti] = React.useState<string[]>([]);

  React.useEffect(() => {
    track("question_shown", { id: question.id, priority: question.priority });
    setText("");
    setMulti([]);
  }, [question.id, question.priority]);

  function send(value: any) {
    track("answer_saved", { id: question.id, priority: question.priority });
    onAnswer(value);
    setText("");
    setMulti([]);
  }

  const skipValue = SKIP_DEFAULTS[question.id as QuestionId] ?? (question.type === "multi" ? (question.options?.includes("none") ? ['none'] : ['unsure']) : question.type === "chipText" ? ["unsure"] : question.type === "text" ? "unsure" : null);

  switch (question.type) {
    case "single":
      return (
        <div className="p-4 rounded-2xl border bg-white/70 dark:bg-neutral-900/70">
          <div className="text-lg font-medium">{question.text}</div>
          <div className="flex flex-wrap gap-2 mt-3">
            {question.options?.map((opt) => (
              <Chip key={opt} onClick={() => send(opt)}>{opt}</Chip>
            ))}
            <Chip onClick={() => send(skipValue)}>Not sure</Chip>
          </div>
        </div>
      );
    case "multi":
      return (
        <div className="p-4 rounded-2xl border bg-white/70 dark:bg-neutral-900/70">
          <div className="text-lg font-medium">{question.text}</div>
          <div className="flex flex-wrap gap-2 mt-3">
            {question.options?.map((opt) => (
              <Chip
                key={opt}
                active={multi.includes(opt)}
                onClick={() =>
                  setMulti((m) =>
                    m.includes(opt) ? m.filter((x) => x !== opt) : [...m, opt]
                  )
                }
              >
                {opt}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => send(multi)}>Continue</Button>
            <Button variant="outline" onClick={() => send(skipValue)}>Im not sure</Button>
          </div>
        </div>
      );
    case "text":
      return (
        <div className="p-4 rounded-2xl border bg-white/70 dark:bg-neutral-900/70">
          <div className="text-lg font-medium">{question.text}</div>
          <div className="mt-3 space-y-3">
            <Input value={text} onChange={(e) => setText(e.target.value)} />
            {onUpload && ["k_fixed_details","b_fixed_details","l_fixed_details"].includes(question.id) && (
              <Upload onUploaded={(url) => onUpload(url)} />
            )}
            <div className="flex gap-2">
              <Button onClick={() => send(text)} disabled={!text.trim()}>Continue</Button>
              <Button variant="outline" onClick={() => send(skipValue)}>Im not sure</Button>
            </div>
          </div>
        </div>
      );
    case "chipText":
      return (
        <div className="p-4 rounded-2xl border bg-white/70 dark:bg-neutral-900/70">
          <div className="text-lg font-medium">{question.text}</div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const tokens = text
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 3);
              send(tokens);
            }}
          >
            <Input value={text} onChange={(e) => setText(e.target.value)} />
            <Button type="submit">Send</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => send(skipValue)}
            >
              Im not sure
            </Button>
          </form>
        </div>
      );
    case "photo":
      return (
        <div className="p-4 rounded-2xl border bg-white/70 dark:bg-neutral-900/70">
          <div className="text-lg font-medium">{question.text}</div>
          <div className="mt-3">
            <Upload onUploaded={(url) => { onUpload?.(url); send(url); }} />
          </div>
        </div>
      );
    default:
      return null;
  }
}

