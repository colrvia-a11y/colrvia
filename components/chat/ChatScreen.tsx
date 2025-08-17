// components/chat/ChatScreen.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "./MessageBubble";
import { QuickReplies, type Chip } from "./QuickReplies";
import { UploadImageButton } from "./UploadImageButton";
import TagInput from "./TagInput";
import { TypingIndicator } from "./TypingIndicator";
import type { Answers } from "@/lib/realtalk/questionnaire";

import "@/styles/chat.css";

type Msg = { role: "assistant" | "user"; content: string };

type StepDTO = {
  id: string;
  kind: "single" | "multi" | "free" | "tags" | "boolean";
  title: string;
  placeholder?: string | null;
  helper?: string | null;
};

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [chips, setChips] = useState<Chip[] | null>(null);
  const [step, setStep] = useState<StepDTO | null>(null);
  const [free, setFree] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  function pushAssistant(text: string) {
    setMessages((m) => [...m, { role: "assistant", content: text }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { role: "user", content: text }]);
  }

  useEffect(() => {
    void fetchNext();
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, step, sending]);

  async function fetchNext(lastUser?: string) {
    setSending(true);
    const resp = await fetch("/api/via/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, lastUser, currentId }),
    })
      .then((r) => r.json())
      .catch(() => ({}));
    setSending(false);

    if (resp.reply && resp.reply !== resp?.question?.title) pushAssistant(resp.reply);
    if (resp.leadIn) pushAssistant(resp.leadIn);

    if (resp.done) {
      const legacy = toLegacyAnswers(answers);
      const story = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, answersV1Legacy: legacy, source: "text_interview_v2" }),
      })
        .then((r) => r.json())
        .catch(() => null);
      const id = story?.id;
      if (id) router.push(`/reveal/${id}`);
      return;
    }

    if (resp.question) {
      setStep(resp.question);
      setChips(resp.chips ?? null);
      setCurrentId(resp.question.id);
      setSelected([]);
      setFree("");
      setTags([]);
    }
  }

  async function submitFree() {
    if (!step) return;
    const text = free.trim();
    if (!text) return;
    pushUser(text);
    setAnswers((a) => setAtPath({ ...a }, step.id, text));
    await fetchNext(text);
  }

  async function submitTags() {
    if (!step) return;
    pushUser(tags.join(", "));
    setAnswers((a) => setAtPath({ ...a }, step.id, tags));
    await fetchNext(tags.join(", "));
  }

  async function submitChips() {
    if (!step) return;
    if (step.kind === "multi" && selected.length === 0) return;
    if (step.kind === "single" && selected.length !== 1) return;
    if (step.kind === "boolean" && selected.length !== 1) return;

    const display = selected
      .map((v) => chips?.find((c) => c.value === v)?.label ?? v)
      .join(", ");
    pushUser(display);

    const value =
      step.kind === "boolean"
        ? selected[0] === "true"
        : step.kind === "single"
          ? selected[0]
          : selected;
    setAnswers((a) => setAtPath({ ...a }, step.id, value));
    await fetchNext(display);
  }

  async function submitTyping(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    pushUser(trimmed);
    await fetchNext(trimmed);
  }

  return (
    <div className="chat-theme flex h-[100dvh] flex-col bg-[var(--chat-bg)] text-[var(--chat-ink)]">
      <header className="sticky top-0 z-10 flex items-center justify-center border-b border-[var(--composer-border)] bg-[var(--chat-bg)] px-4 py-3">
        <h1 className="text-base font-medium">Text Interview</h1>
      </header>

      <div
        ref={scroller}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        role="log"
        aria-live="polite"
      >
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role}>
            {m.content}
          </MessageBubble>
        ))}

        {step && (
          <MessageBubble role="assistant">
            <div className="text-[15px]">{step.title}</div>
          </MessageBubble>
        )}

        {sending && <TypingIndicator />}
      </div>

      <div className="sticky bottom-0 z-10 space-y-2 bg-[var(--chat-bg)] px-4 pb-4">
        <UploadImageButton
          onNotes={(n) =>
            setMessages((m) => [...m, { role: "assistant", content: `Photo notes: ${n}` }])
          }
        />

        {step && (step.kind === "single" || step.kind === "multi" || step.kind === "boolean") && chips && (
          <div className="space-y-2">
            <QuickReplies
              chips={
                step.kind === "boolean"
                  ? [
                      { value: "true", label: "Yes" },
                      { value: "false", label: "No" },
                    ]
                  : chips
              }
              multi={step.kind === "multi"}
              selected={selected}
              onSelect={setSelected}
            />
            <button
              type="button"
              onClick={submitChips}
              className="rounded-xl border border-[var(--composer-border)] bg-[var(--composer-bg)] px-3 py-2 text-sm disabled:opacity-50"
              disabled={sending}
            >
              Save
            </button>
          </div>
        )}

        {step?.kind === "tags" && (
          <div className="space-y-2">
            <TagInput
              values={tags}
              onChange={setTags}
              placeholder="Type a word, press Enter"
              helper={step.helper ?? undefined}
            />
            <button
              type="button"
              onClick={submitTags}
              className="rounded-xl border border-[var(--composer-border)] bg-[var(--composer-bg)] px-3 py-2 text-sm disabled:opacity-50"
              disabled={sending}
            >
              Save
            </button>
          </div>
        )}

        {(!step || step.kind === "free") && (
          <Composer
            value={step?.kind === "free" ? free : undefined}
            onChange={step?.kind === "free" ? setFree : undefined}
            placeholder={step?.placeholder ?? "Type a message..."}
            onSubmit={async (text) => {
              if (step && step.kind === "free") {
                await submitFree();
              } else {
                await submitTyping(text);
              }
            }}
            disabled={sending}
          />
        )}
      </div>
    </div>
  );
}

// Small helpers -----------------------------------------------------------

function setAtPath(obj: any, path: string, value: any) {
  const keys = path.split(".");
  let node = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    node[keys[i]] ??= {};
    node = node[keys[i]];
  }
  node[keys[keys.length - 1]] = value;
  return obj;
}

function toLegacyAnswers(a: any) {
  const roomMap: Record<string, string> = {
    kitchen: "Kitchen",
    bathroom: "Bathroom",
    bedroom: "Bedroom",
    livingRoom: "Living Room",
    diningRoom: "Dining Room",
    office: "Office",
    kidsRoom: "Kids Room",
    laundryMudroom: "Laundry/Mudroom",
    entryHall: "Entry/Hall",
    other: "Other",
  };
  const lightMap: Record<string, "Bright" | "Mixed" | "Low"> = {
    veryBright: "Bright",
    kindaBright: "Mixed",
    dim: "Low",
  };
  const contrastMap: Record<string, "Softer" | "Balanced" | "Bolder"> = {
    verySoft: "Softer",
    medium: "Balanced",
    crisp: "Bolder",
  };
  const vibe = a?.colorComfort?.overallVibe;
  const warmCool = a?.colorComfort?.warmCoolFeel;
  let style = "Cozy Neutral";
  if (vibe === "mostlySoftNeutrals") style = warmCool === "cooler" ? "Clean Minimal" : "Cozy Neutral";
  if (vibe === "neutralsPlusGentleColors") style = "Modern Warm";
  if (vibe === "confidentColorMoments") style = "Bold Color";

  const fixedBits: string[] = [];
  const floor = a?.existingElements?.floorLook;
  if (floor) fixedBits.push(`floor:${floor}`);
  const metals = a?.existingElements?.metals;
  if (metals) fixedBits.push(`metals:${metals}`);
  const big = a?.existingElements?.bigThingsToMatch?.join(", ");
  if (big) fixedBits.push(`match:${big}`);
  if (a?.existingElements?.mustStaySame) fixedBits.push(a.existingElements.mustStaySame);

  const brandMap: Record<string, string> = {
    SherwinWilliams: "Sherwin-Williams",
    BenjaminMoore: "Benjamin Moore",
    Behr: "Behr",
    pickForMe: "Sherwin-Williams",
  };

  return {
    room_type: roomMap[a?.roomType] ?? "Other",
    lighting: lightMap[a?.daytimeBrightness] ?? "Mixed",
    style_primary: style,
    mood_words: a?.moodWords ?? [],
    dark_color_ok: contrastMap[a?.colorComfort?.contrastLevel] ?? "Balanced",
    fixed_elements: fixedBits.join("; "),
    avoid_colors: (a?.colorsToAvoid ?? []).join(", "),
    brand: brandMap[a?.brandPreference] ?? "Sherwin-Williams",
  };
}

// ------------------------------------------------------------------------

type ComposerProps = {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  onSubmit: (text: string) => void | Promise<void>;
  disabled?: boolean;
};

function Composer({ value, onChange, placeholder, onSubmit, disabled }: ComposerProps) {
  const [local, setLocal] = useState("");
  const val = value ?? local;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit(val);
        if (onChange) onChange("");
        setLocal("");
      }}
      className="flex items-end gap-2 rounded-[var(--radius-pill)] border border-[var(--composer-border)] bg-[var(--composer-bg)] px-3 py-2"
    >
      <textarea
        value={val}
        onChange={(e) => {
          onChange?.(e.target.value);
          setLocal(e.target.value);
        }}
        placeholder={placeholder}
        className="min-h-[2rem] max-h-32 flex-1 resize-none bg-transparent text-sm outline-none"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void onSubmit(val);
            if (onChange) onChange("");
            setLocal("");
          }
        }}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !val.trim()}
        className="rounded-lg bg-[var(--send-enabled)] px-3 py-1 text-sm font-medium text-[var(--bubble-user-ink)] disabled:bg-[var(--send-disabled)]"
      >
        Send
      </button>
    </form>
  );
}

