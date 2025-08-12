export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { designPalette } from "@/lib/ai/orchestrator"

export async function POST(req: Request) {
  const { sessionId } = await req.json()
  if (!sessionId) return NextResponse.json({ error:"session_required" }, { status: 400 })
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: session } = await supa
    .from("intake_sessions")
    .select("*")
    .eq("id", sessionId)
    .single()
  const { data: guideline } = await supa
    .from("palette_guidelines")
    .select("config,designer_id,brand")
    .eq("is_active", true)
    .maybeSingle()

  const clean = (v: any) => {
    if (v === undefined || v === null) return undefined
    if (typeof v === "string" && /not sure/i.test(v)) return undefined
    return v
  }

  const answers = session.answers || {}
  const vibeRaw = clean(answers.vibe)
  const vibe = Array.isArray(vibeRaw)
    ? vibeRaw.filter((x: any) => typeof x === "string" && !/not sure/i.test(x))
    : typeof vibeRaw === "string"
    ? [vibeRaw]
    : []

  const input = {
    brand: clean(answers.brand) ?? guideline?.brand ?? "Sherwin-Williams",
    lighting: clean(answers.lighting) ?? "Mixed",
    vibe,
    space: clean(answers.room) ?? "Living Room",
    contrast: guideline?.config?.contrast ?? "balanced",
    seed: `sess:${session.id}`
  }

  // pass guidelines in a safe way (orchestrator can use ratios/whites/bounds)
  const paletteV2 = await designPalette(input)
  return NextResponse.json({ input, palette_v2: paletteV2 })
}
