import { NextRequest } from "next/server";
import type { SessionState } from "@/lib/types";
import { IntakeTurnZ } from "@/lib/model-schema";
import { buildQuestionQueue } from "@/lib/intake/engine";
import { QUESTIONS } from "@/lib/intake/questions";

export const dynamic = "force-dynamic";

type ChatBody = { userMessage: any; sessionState: SessionState };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatBody;
    const state = body?.sessionState as SessionState;
    if (!state) {
      return new Response(JSON.stringify({ error: "Missing sessionState" }), { status: 400 });
    }

    const answers = state.answers as Record<string, any>;
    const queue = buildQuestionQueue(answers as any);
    const nextId = queue.find((id) => {
      const q = QUESTIONS[id];
      const field = q.field ?? q.id;
      const val = (answers as any)[field];
      if (Array.isArray(val)) return val.length === 0;
      return val === undefined || val === null || val === "";
    });

    if (!nextId) {
      const done = {
        field_id: "_complete",
        next_question: "That’s everything I need for now. Ready for your palette reveal?",
        input_type: "text",
        explain_why: "I have the core details and fixed elements logged.",
      } as const;
      const check = IntakeTurnZ.safeParse(done);
      if (!check.success) {
        return new Response(JSON.stringify({ error: "Internal shape error", issues: check.error.issues }), { status: 500 });
      }
      return new Response(JSON.stringify(check.data), { headers: { "Content-Type": "application/json" } });
    }

    const q = QUESTIONS[nextId];
    const turn = {
      field_id: q.field ?? q.id,
      next_question: q.text,
      input_type:
        q.type === "single" ? "singleSelect" : q.type === "multi" ? "multiSelect" : "text",
      choices: q.options,
    } as const;

    const parsed = IntakeTurnZ.safeParse(turn);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Schema validation failed", issues: parsed.error.issues }), { status: 500 });
    }

    return new Response(JSON.stringify(parsed.data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("/api/chat error", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), { status: 500 });
  }
}
