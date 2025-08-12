import { NextRequest } from "next/server";
import { getNextField } from "@/lib/engine";
import type { SessionState } from "@/lib/types";
import { IntakeTurnZ } from "@/lib/model-schema";

export const dynamic = "force-dynamic";

type ChatBody = { userMessage: string; sessionState: SessionState };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatBody;
    const state = body?.sessionState as SessionState;
    if (!state) {
      return new Response(JSON.stringify({ error: "Missing sessionState" }), { status: 400 });
    }

    const next = getNextField(state);

    if (!next) {
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

    const turn = {
      field_id: (next as any).id,
      next_question: (next as any).label || "Please provide this detail:",
      input_type: (next as any).input_type,
      choices: (next as any).options,
      explain_why: (next as any).helper,
      validation: (typeof (next as any).min === "number" || typeof (next as any).max === "number")
        ? { min: (next as any).min ?? 0, max: (next as any).max ?? 5 }
        : undefined,
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
