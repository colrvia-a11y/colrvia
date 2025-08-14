import OpenAI from "openai";
import { NextRequest } from "next/server";
import { VISION_MODEL } from "@/lib/ai/config";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return new Response(JSON.stringify({ error: "imageUrl required" }), { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "missing OpenAI API key" }), { status: 500 });
    const client = new OpenAI({ apiKey });
    const res = await client.responses.create({
      model: VISION_MODEL,
      input: [
        { role: "user", content: [
          { type: "input_text", text: "Report neutral observations useful for paint selection: undertones, relative contrast, and risks of color cast. Do NOT suggest specific paint colors." },
          { type: "input_image", image_url: imageUrl, detail: "low" }
        ]}
      ] as any
    });

    const text = (res as any).output_text || "";
    return new Response(JSON.stringify({ notes: text }), { headers: { "Content-Type":"application/json" }});
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e?.message || "vision error" }), { status: 500 });
  }
}
