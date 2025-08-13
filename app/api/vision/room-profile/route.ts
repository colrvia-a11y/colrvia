export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { RoomProfileSchema } from "@/lib/vision/roomProfile";
import { logAiUsage } from '@/lib/metrics/logger'
import { VISION_SYSTEM_PROMPT, buildVisionUserPrompt } from "@/lib/vision/prompt";

const BodySchema = z.object({
  images: z.array(z.string().url().or(z.string().startsWith("data:"))).min(1).max(6), // data URLs or https URLs
  roomType: z.string().optional(),
  goals: z.array(z.string()).optional(),
  brand: z.enum(["Sherwin-Williams","Behr"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = BodySchema.parse(await req.json());
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const messages: any[] = [
      { role: "system", content: VISION_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: buildVisionUserPrompt({ roomType: body.roomType, goals: body.goals, brand: body.brand }) },
          ...body.images.map((u) => ({
            type: "image_url",
            image_url: { url: u },
          })),
        ],
      },
    ];

    const model = process.env.OPENAI_VISION_MODEL || "gpt-4o";
    const resp = await client.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages,
    });

    // Best-effort logging (service role insert) – swallow errors.
    const usage: any = (resp as any)?.usage || {}
    logAiUsage({
      event: 'vision_room_profile',
      model,
      input_tokens: usage.prompt_tokens,
      output_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
      metadata: { images: body.images?.length || 0 }
    }).catch(()=>{})

    const raw = resp.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    const profile = RoomProfileSchema.parse(parsed);

    return new Response(JSON.stringify({ ok: true, profile }), { headers: { "Content-Type": "application/json" }, status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "vision_error" }), { status: 400 });
  }
}
