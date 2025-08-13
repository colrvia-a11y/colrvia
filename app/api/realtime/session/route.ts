export const runtime = 'nodejs';
import { NextRequest } from "next/server";
import SYSTEM_PROMPT from "@/lib/prompt/system";

/**
 * POST /api/realtime/session
 * Creates a short-lived Realtime session token for the client to start a WebRTC call.
 * Body (optional): { voice?: string, model?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { voice, model } = (await req.json().catch(() => ({}))) as {
      voice?: string;
      model?: string;
    };

    const rtModel = model || process.env.OPENAI_REALTIME_MODEL || "gpt-4o-realtime-preview-2024-12-17";
    const rtVoice = voice || process.env.OPENAI_TTS_VOICE || "alloy";

    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: rtModel,
        voice: rtVoice,
        instructions: SYSTEM_PROMPT +
          "\n\nKeep replies warm, brief, and natural."
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return new Response(JSON.stringify({ error: "Failed to create realtime session", details: text }), {
        status: r.status,
      });
    }

    const data = await r.json();
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" }, status: 200 });
  } catch (err: any) {
    console.error("/api/realtime/session error", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), { status: 500 });
  }
}
