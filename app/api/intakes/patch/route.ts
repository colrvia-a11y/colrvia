export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { INTAKE_COOKIE, parseCookie, hashToken } from "@/lib/intake/token"

export async function POST(req: Request) {
  let jar: string | undefined
  try { jar = cookies().get(INTAKE_COOKIE)?.value } catch { /* test env without request store */ }
  if(!jar){
    // test fallback header
    const hdr = (req as any).headers?.get?.('x-intake-cookie')
    if(hdr) jar = hdr
  }
  const parsed = parseCookie(jar)
  if (!parsed) return NextResponse.json({ error: "missing cookie" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { state, messages, done } = body ?? {}
  if (!state || !messages) return NextResponse.json({ error: "state & messages required" }, { status: 400 })

  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
  const { error } = await supa.from("intakes")
    .update({ state, messages, done: !!done, updated_at: new Date().toISOString() })
    .eq("id", parsed.id)
    .eq("token_hash", hashToken(parsed.token))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
