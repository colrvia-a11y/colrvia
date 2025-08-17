"use client";

import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChipList } from "./ChipList";
import { UploadImageButton } from "./UploadImageButton";
import type { Answers, QuestionId } from "@/lib/realtalk/questionnaire";
import { useRouter } from "next/navigation";

type Msg = { role: "assistant" | "user"; content: string };

export default function InterviewChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentId, setCurrentId] = useState<QuestionId | null>(null);
  const [chips, setChips] = useState<{ value: string; label: string }[] | null>(null);
  const [question, setQuestion] = useState<{ id: QuestionId; kind: "single"|"multi"|"free"; prompt: string; placeholder?: string|null } | null>(null);
  const [free, setFree] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  function pushAssistant(text: string) {
    setMessages(m => [...m, { role: "assistant", content: text }]);
  }
  function pushUser(text: string) {
    setMessages(m => [...m, { role: "user", content: text }]);
  }

  // Boot
  useEffect(() => {
    void fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, chips, question]);

  async function fetchNext(lastUser?: string) {
    setSending(true);
    const resp = await fetch("/api/via/interview", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ answers, lastUser, currentId }),
    }).then(r => r.json());
    setSending(false);

    if (resp.reply) pushAssistant(resp.reply);
    if (resp.done) {
      // Finish interview → create story
      const story = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, source: "text_interview" }),
      }).then(r => r.json());
      const id = story?.id;
      if (id) router.push(`/reveal/${id}`);
      return;
    }

    setQuestion(resp.question);
    setChips(resp.chips);
    setCurrentId(resp.question?.id ?? null);
    setSelected([]);
    setFree("");
  }

  function mergeAnswer(qid: QuestionId, values: string[]) {
    const a: Answers = { ...answers };
    if (qid === "mood_words") a.mood_words = values;
    else if (qid === "dark_color_ok") a.dark_color_ok = values[0] as any;
    else if (qid === "lighting") a.lighting = values[0] as any;
    else if (qid === "room_type") a.room_type = values[0]!;
    else if (qid === "style_primary") a.style_primary = values[0]!;
    else if (qid === "brand") a.brand = values[0] as any;
    setAnswers(a);
  }

  async function submitFree() {
    if (!question) return;
    const text = free.trim();
    if (!text) return;
    pushUser(text);
    if (question.id === "fixed_elements") setAnswers(a => ({ ...a, fixed_elements: text }));
    if (question.id === "avoid_colors") setAnswers(a => ({ ...a, avoid_colors: text }));
    await fetchNext(text);
  }

  async function submitChips() {
    if (!question) return;
    if (question.kind === "multi" && selected.length === 0) return;
    if ((question.kind === "single" && selected.length !== 1)) return;

    pushUser(selected.map(v => chips?.find(c => c.value === v)?.label ?? v).join(", "));
    mergeAnswer(question.id, selected);
    await fetchNext(selected.join(", "));
  }

  async function submitTyping(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    pushUser(trimmed);
    // If a current question is free text and empty, treat as answer; else treat as side Q.
    if (question?.kind === "free" && !free) {
      if (question.id === "fixed_elements") setAnswers(a => ({ ...a, fixed_elements: trimmed }));
      if (question.id === "avoid_colors") setAnswers(a => ({ ...a, avoid_colors: trimmed }));
    }
    await fetchNext(trimmed);
  }

  return (
    <div className="mx-auto w-full max-w-screen-sm h-[calc(100dvh-140px)] flex flex-col gap-4">
      <header className="pt-4">
        <h1 className="text-xl font-medium">Text Interview</h1>
        <p className="text-sm opacity-70">We’ll chat through a few quick questions. You can ask anything as we go.</p>
      </header>

      <div ref={scroller} className="flex-1 overflow-y-auto space-y-3 rounded-2xl border border-black/10 p-3 bg-white">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role}>{m.content}</MessageBubble>
        ))}

        {question && (
          <MessageBubble role="assistant">
            <div className="space-y-3">
              <div className="text-[15px]">{question.prompt}</div>
              {chips && (
                <ChipList
                  chips={chips}
                  multi={question.kind === "multi"}
                  onSelect={setSelected}
                  selected={selected}
                />
              )}
            </div>
          </MessageBubble>
        )}
      </div>

      <div className="space-y-2">
        <UploadImageButton
          onNotes={(n) => setMessages(m => [...m, { role:"assistant", content: `Photo notes: ${n}` }])}
        />

        {/* Composer */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = form.elements.namedItem("msg") as HTMLInputElement;
            const val = input.value;
            input.value = "";
            await submitTyping(val);
          }}
          className="flex items-center gap-2"
        >
          <input
            name="msg"
            aria-label="Type a message"
            placeholder="Type a message…"
            className="flex-1 rounded-2xl border border-black/10 px-4 py-3"
          />
          <button
            type="button"
            onClick={submitChips}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
            disabled={sending}
          >
            Send
          </button>
        </form>

        {question?.kind === "free" && (
          <div className="flex gap-2">
            <input
              value={free}
              onChange={(e) => setFree(e.target.value)}
              placeholder={question.placeholder ?? ""}
              className="flex-1 rounded-2xl border border-black/10 px-4 py-3"
            />
            <button
              type="button"
              onClick={submitFree}
              className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
            >
              Save answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
