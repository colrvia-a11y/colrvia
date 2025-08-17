// components/chat/InterviewChat.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChipList } from "./ChipList";
import { UploadImageButton } from "./UploadImageButton";
import TagInput from "./TagInput";
import type { Answers } from "@/lib/realtalk/questionnaire";
import { useRouter } from "next/navigation";

type Msg = { role: "assistant" | "user"; content: string };

type StepDTO = {
  id: string;
  kind: "single" | "multi" | "free" | "tags" | "boolean";
  title: string;
  placeholder?: string | null;
  helper?: string | null;
};
type Chip = { value: string; label: string };

export default function InterviewChat() {
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

  function pushAssistant(text: string) { setMessages(m => [...m, { role: "assistant", content: text }]); }
  function pushUser(text: string) { setMessages(m => [...m, { role: "user", content: text }]); }

  useEffect(() => { void fetchNext(); }, []);
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [messages, chips, step]);

  async function fetchNext(lastUser?: string) {
    setSending(true);
    const resp = await fetch("/api/via/interview", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ answers, lastUser, currentId }),
    }).then(r => r.json()).catch(() => ({}));
    setSending(false);

    if (resp.reply) pushAssistant(resp.reply);

    if (resp.done) {
      // Legacy shim to keep builder happy until full server mapping adopts v2
      const legacy = toLegacyAnswers(answers);
      const story = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, answersV1Legacy: legacy, source: "text_interview_v2" }),
      }).then(r => r.json()).catch(() => null);
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
    setAnswers(a => setAtPath({ ...a }, step.id, text));
    await fetchNext(text);
  }

  async function submitTags() {
    if (!step) return;
    pushUser(tags.join(", "));
    setAnswers(a => setAtPath({ ...a }, step.id, tags));
    await fetchNext(tags.join(", "));
  }

  async function submitChips() {
    if (!step) return;
    if (step.kind === "multi" && selected.length === 0) return;
    if (step.kind === "single" && selected.length !== 1) return;
    if (step.kind === "boolean" && selected.length !== 1) return;

    const display = selected.map(v => chips?.find(c => c.value === v)?.label ?? v).join(", ");
    pushUser(display);

    const value = step.kind === "boolean" ? (selected[0] === "true") : (step.kind === "single" ? selected[0] : selected);
    setAnswers(a => setAtPath({ ...a }, step.id, value));
    await fetchNext(display);
  }

  async function submitTyping(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    pushUser(trimmed);
    await fetchNext(trimmed); // side question / digression handled server-side
  }

  return (
    <div className="mx-auto w-full max-w-screen-sm h-[calc(100dvh-140px)] flex flex-col gap-4">
      <header className="pt-4">
        <h1 className="text-xl font-medium">Text Interview</h1>
        <p className="text-sm opacity-70">We’ll chat through smart questions. You can ask anything as we go.</p>
      </header>

      <div ref={scroller} className="flex-1 overflow-y-auto space-y-3 rounded-2xl border border-black/10 p-3 bg-white">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role}>{m.content}</MessageBubble>
        ))}

        {step && (
          <MessageBubble role="assistant">
            <div className="space-y-3">
              <div className="text-[15px]">{step.title}</div>

              {/* Chips for single/multi/boolean */}
              {(step.kind === "single" || step.kind === "multi" || step.kind === "boolean") && chips && (
                <div className="space-y-2">
                  <ChipList
                    chips={step.kind === "boolean"
                      ? [{ value: "true", label: "Yes" }, { value: "false", label: "No" }]
                      : chips}
                    multi={step.kind === "multi"}
                    onSelect={setSelected}
                    selected={selected}
                  />
                  <button
                    type="button"
                    onClick={submitChips}
                    className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
                    disabled={sending}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </MessageBubble>
        )}
      </div>

      {(!step || step.kind === "free" || step.kind === "tags") && (
        <div className="space-y-2">
          <UploadImageButton
            onNotes={(n) => setMessages(m => [...m, { role:"assistant", content: `Photo notes: ${n}` }])}
          />

          {/* Composer */}
          {step?.kind === "tags" ? (
            <div className="space-y-2">
              <TagInput values={tags} onChange={setTags} placeholder="Type a word, press Enter" helper={step.helper ?? undefined} />
              <button
                type="button"
                onClick={submitTags}
                className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
                disabled={sending}
              >
                Save
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (step && step.kind === "free") {
                  await submitFree();
                } else {
                  const form = e.currentTarget;
                  const input = form.elements.namedItem("msg") as HTMLInputElement;
                  const val = input.value;
                  input.value = "";
                  await submitTyping(val);
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                name="msg"
                aria-label="Type a message"
                placeholder={step?.placeholder ?? "Ask anything…"}
                className="flex-1 rounded-2xl border border-black/10 px-4 py-3"
                value={step && step.kind === "free" ? free : undefined}
                onChange={step && step.kind === "free" ? (e) => setFree(e.target.value) : undefined}
              />
              <button
                type="submit"
                className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
                disabled={sending}
              >
                {step ? "Save" : "Send"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- small helpers ----------

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

// Best-effort legacy shim for existing builder mapping.
function toLegacyAnswers(a: any) {
  const roomMap: Record<string,string> = {
    kitchen: "Kitchen", bathroom: "Bathroom", bedroom: "Bedroom", livingRoom: "Living Room",
    diningRoom: "Dining Room", office: "Office", kidsRoom: "Kids Room",
    laundryMudroom: "Laundry/Mudroom", entryHall: "Entry/Hall", other: "Other",
  };
  const lightMap: Record<string,"Bright"|"Mixed"|"Low"> = {
    veryBright: "Bright", kindaBright: "Mixed", dim: "Low",
  };
  const contrastMap: Record<string,"Softer"|"Balanced"|"Bolder"> = {
    verySoft: "Softer", medium: "Balanced", crisp: "Bolder",
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

  const brandMap: Record<string,string> = {
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
