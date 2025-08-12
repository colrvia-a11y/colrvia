import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sdp, model, token } = await req.json();
    if (!sdp) return new Response(JSON.stringify({ error: "Missing sdp" }), { status: 400 });

    const mdl = model || process.env.OPENAI_REALTIME_MODEL || "gpt-4o-realtime-preview-2024-12-17";
    const auth = token ? `Bearer ${token}` : `Bearer ${process.env.OPENAI_API_KEY}`;
    const r = await fetch(`https://api.openai.com/v1/realtime?model=${encodeURIComponent(mdl)}`, {
      method: "POST",
      headers: {
        Authorization: auth,
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
