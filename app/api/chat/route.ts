import OpenAI from "openai";
import { NextRequest } from "next/server";
import SYSTEM_PROMPT from "@/lib/prompt/system";
import { IntakeTurnZ, IntakeTurnJSONSchema } from "@/lib/model-schema";
import type { SessionState } from "@/lib/types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const dynamic = "force-dynamic"; // ensure SSR

type ChatBody = {
  userMessage: string;
  sessionState: SessionState;
};

/**
 * POST /api/chat
 * Body: { userMessage, sessionState }
 * Returns: IntakeTurn (strict JSON) validated by Zod.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatBody;
    if (!body?.userMessage) {
      return new Response(JSON.stringify({ error: "Missing userMessage" }), { status: 400 });
    }

    // Minimal context the model needs each turn
    const condensedState = {
      room_type: body.sessionState?.room_type ?? null,
      answers: body.sessionState?.answers ?? {},
      progress: body.sessionState?.progress ?? 0,
    };

    // Call the Responses API with Structured Outputs (strict JSON Schema)
    const options: any = {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions: SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "You are driving an intake for home color design. " +
                "Here is the current session state (JSON):\n" +
                JSON.stringify(condensedState) +
                "\n" +
                "User just said:\n" +
                body.userMessage +
                "\nReturn ONLY the next IntakeTurn as strict JSON.",
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: IntakeTurnJSONSchema,
      },
    };

    const res = await client.responses.create(options);

    // Extract JSON text safely
    const raw = (res as any).output_text ?? JSON.stringify((res as any).output?.[0]?.content?.[0]?.json ?? {});
    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return new Response(JSON.stringify({ error: "Model did not return valid JSON", raw }), { status: 502 });
    }

    // Validate against Zod
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
