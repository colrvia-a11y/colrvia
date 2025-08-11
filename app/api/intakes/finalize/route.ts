export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { INTAKE_COOKIE, parseCookie, hashToken } from "@/lib/intake/token"

export async function POST(req: Request) {
  let jar: string | undefined
  try { jar = cookies().get(INTAKE_COOKIE)?.value } catch { /* test env */ }
  if(!jar){
    const hdr = (req as any).headers?.get?.('x-intake-cookie')
    if(hdr) jar = hdr
  }
  const parsed = parseCookie(jar)
  if (!parsed) return NextResponse.json({ error: "missing cookie" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const { storyId } = body ?? {}
  if (!storyId) return NextResponse.json({ error: "storyId required" }, { status: 400 })

  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
  const { error } = await supa.from("intakes")
    .update({ story_id: storyId, done: true, updated_at: new Date().toISOString() })
    .eq("id", parsed.id)
    .eq("token_hash", hashToken(parsed.token))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // clear cookie so a new session starts fresh
  const res = NextResponse.json({ ok: true })
  res.headers.set("Set-Cookie", `${INTAKE_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`)
  return res
}
