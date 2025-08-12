import OpenAI from "openai";
import { NextRequest } from "next/server";
import SYSTEM_PROMPT from "@/lib/prompt/system";
import { IntakeTurnZ, IntakeTurnJSONSchema } from "@/lib/model-schema";
import type { SessionState } from "@/lib/types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const dynamic = "force-dynamic";

type ChatBody = { userMessage: string; sessionState: SessionState };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatBody;
    if (!body?.userMessage) {
      return new Response(JSON.stringify({ error: "Missing userMessage" }), { status: 400 });
    }

    const condensedState = {
      room_type: body.sessionState?.room_type ?? null,
      answers: body.sessionState?.answers ?? {},
      progress: body.sessionState?.progress ?? 0,
    };

    const res = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions: SYSTEM_PROMPT,
      text: {
        format: {
          type: "json_schema",
          name: "IntakeTurn",
          schema: IntakeTurnJSONSchema.schema,
          strict: true,
        },
      },
      input:
        "You are driving an intake for home color design.\n" +
        "Current session (JSON): " +
        JSON.stringify(condensedState) +
        "\nUser said: " +
        body.userMessage +
        "\nReturn ONLY IntakeTurn JSON.",
    });

    const raw =
      (res as any).output_text ??
      JSON.stringify((res as any).output?.[0]?.content?.[0]?.json ?? {});
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return new Response(JSON.stringify({ error: "Model did not return valid JSON", raw }), { status: 502 });
    }

    const turn = IntakeTurnZ.safeParse(parsed);
    if (!turn.success) {
      return new Response(JSON.stringify({ error: "Schema validation failed", issues: turn.error.issues, raw }), {
        status: 502,
      });
    }

    return new Response(JSON.stringify(turn.data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("/api/chat error", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), { status: 500 });
  }
}
