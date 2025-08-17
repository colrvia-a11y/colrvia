import { NextRequest } from "next/server";
import { getQuestionById, firstQuestionId, nextIdFor, Answers } from "@/lib/realtalk/questionnaire";

export const runtime = "nodejs";

type Body = {
  answers?: Answers;
  lastUser?: string;             // free-typed message, optional
  currentId?: string | null;     // last asked question id
};

export async function POST(req: NextRequest) {
  const { answers = {}, lastUser, currentId }: Body = await req.json();

  // If user typed something that isn't an answer, gently answer via Q&A, then steer back.
  let sideAnswer: string | null = null;
  if (lastUser && !looksLikeDirectAnswer(lastUser)) {
    try {
      const qa = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/via/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: lastUser }),
      }).then(r => r.json());
      sideAnswer = qa?.answer || null;
    } catch {
      sideAnswer = null;
    }
  }

  // Compute next question id
  const nextId = !currentId ? firstQuestionId : nextIdFor(currentId as any, answers);
  if (nextId === "END") {
    return new Response(
      JSON.stringify({
        done: true,
        reply:
          sideAnswer
            ? `${sideAnswer}\n\nThat covers it. I’ve got everything I need—ready to reveal your palette!`
            : `I’ve got everything I need—ready to reveal your palette!`,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const q = getQuestionById(nextId as any)!;

  // Compose conversational reply + chips
  const reply = [
    sideAnswer ? sideAnswer + "\n\n" : "",
    leadInFor(q.id),
    q.prompt,
  ].join("");

  const chips =
    q.kind === "single" || q.kind === "multi" ? q.choices : null;

  return new Response(
    JSON.stringify({
      done: false,
      question: { id: q.id, kind: q.kind, prompt: q.prompt, placeholder: (q as any).placeholder || null },
      reply,
      chips,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}

function looksLikeDirectAnswer(text: string) {
  // Heuristic: short phrases likely intended as answers are not treated as side questions.
  return text.length <= 40 && !/[?.!]$/.test(text);
}

function leadInFor(id: string) {
  switch (id) {
    case "room_type": return "Let’s design your space. ";
    case "lighting": return "Great—";
    case "style_primary": return "Got it. ";
    case "mood_words": return "Nice taste. ";
    case "dark_color_ok": return "And contrast-wise, ";
    case "fixed_elements": return "Anything we should honor in the room materials? ";
    case "avoid_colors": return "Good to know. ";
    case "brand": return "Last one. ";
    default: return "";
  }
}
