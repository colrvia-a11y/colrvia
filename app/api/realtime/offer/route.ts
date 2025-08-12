import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sdp, model } = await req.json();
    if (!sdp) return new Response(JSON.stringify({ error: "Missing sdp" }), { status: 400 });

    const mdl = model || process.env.OPENAI_REALTIME_MODEL || "gpt-4o-realtime-preview-2024-12-17";
    const r = await fetch(`https://api.openai.com/v1/realtime?model=${encodeURIComponent(mdl)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/sdp",
      },
      body: sdp,
    });

    const text = await r.text();
    if (!r.ok) {
      return new Response(JSON.stringify({ error: "Realtime offer failed", details: text }), { status: r.status });
    }
    return new Response(text, { headers: { "Content-Type": "application/sdp" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "server error" }), { status: 500 });
  }
}
