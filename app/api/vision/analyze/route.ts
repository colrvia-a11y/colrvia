import { NextRequest } from "next/server";
import { VISION_MODEL } from "@/lib/ai/config";
import { getOpenAI } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return new Response(JSON.stringify({ error: "imageUrl required" }), { status: 400 });

    const openai = getOpenAI();
    const res = await openai.responses.create({
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
