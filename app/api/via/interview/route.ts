// app/api/via/interview/route.ts
import { NextRequest } from "next/server";
import { Answers, firstStepId, getStepById, nextStepId } from "@/lib/realtalk/questionnaire";

export const runtime = "nodejs";

type Body = { answers?: Answers; lastUser?: string; currentId?: string | null };

export async function POST(req: NextRequest) {
  const { answers = {}, lastUser, currentId }: Body = await req.json();

  // Optional digressions → short answer via Q&A
  let sideAnswer: string | null = null;
  if (lastUser && !looksLikeDirectAnswer(lastUser)) {
    try {
      const qa = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/via/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: lastUser }),
      }).then(r => r.json());
      sideAnswer = qa?.answer || null;
    } catch { sideAnswer = null; }
  }

  const nextId = !currentId ? firstStepId : nextStepId(currentId, answers);
  if (nextId === "END") {
    return json({
      done: true,
      reply: sideAnswer
        ? `${sideAnswer}\n\nThat covers it. I’ve got everything I need—ready to reveal your palette!`
        : `I’ve got everything I need—ready to reveal your palette!`,
    });
  }

  const s = getStepById(nextId)!;
  const reply = [
    sideAnswer ? sideAnswer + "\n\n" : "",
    leadInFor(s.id),
    s.title,
  ].join("");

  const chips =
    s.kind === "single" || s.kind === "multi"
      ? (s as any).choices
      : s.kind === "boolean"
      ? [{ value: "true", label: "Yes" }, { value: "false", label: "No" }]
      : null;

  return json({
    done: false,
    reply,
    question: {
      id: s.id,
      kind: s.kind,
      title: s.title,
      placeholder: (s as any).placeholder ?? null,
      helper: (s as any).helper ?? null,
    },
    chips,
  });
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function looksLikeDirectAnswer(text: string) {
  // short, no punctuation likely an answer (vs a full question)
  return text.length <= 40 && !/[?.!]/.test(text);
}

function leadInFor(id: string) {
  if (id.startsWith("roomSpecific.")) return "Room details — ";
  if (id.startsWith("existingElements.")) return "Let’s note a few existing elements. ";
  if (id.startsWith("colorComfort.")) return "Your color comfort. ";
  if (id.startsWith("finishes.")) return "Cleanability & finishes. ";
  if (id.startsWith("guardrails.")) return "Final guardrails. ";
  if (id === "photos") return "Optional photos. ";
  return "";
}
