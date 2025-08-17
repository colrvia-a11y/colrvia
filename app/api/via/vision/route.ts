import { NextRequest } from "next/server";
import OpenAI from "openai";
import { MODELS } from "@/lib/ai/config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { imageDataUrl } = await req.json();
  if (!imageDataUrl) {
    return new Response(JSON.stringify({ notes: "No image provided." }), { headers: { "Content-Type": "application/json" } });
  }

  try {
    const client = new OpenAI();
    const resp = await client.chat.completions.create({
      model: MODELS.CHAT,
      messages: [
        { role: "system", content: "You are a concise interior paint assistant. Describe undertones, light, and any color conflicts you see." },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this room photo for undertones, lighting, and fixed elements that affect paint choices." },
            { type: "image_url", image_url: { url: imageDataUrl } as any },
          ] as any,
        },
      ],
      temperature: 0.2,
      max_tokens: 250,
    });

    const notes = resp.choices[0]?.message?.content?.trim() || "Looks good.";
    return new Response(JSON.stringify({ notes }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ notes: "Image analysis unavailable right now." }), { headers: { "Content-Type": "application/json" }, status: 200 });
  }
}
