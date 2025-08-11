export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { INTAKE_COOKIE, parseCookie, hashToken } from "@/lib/intake/token"

export async function GET(req: Request) {
  let jar: string | undefined
  try { jar = cookies().get(INTAKE_COOKIE)?.value } catch { /* test env */ }
  if(!jar){
    const hdr = (req as any).headers?.get?.('x-intake-cookie')
    if(hdr) jar = hdr
  }
  const parsed = parseCookie(jar)
  if (!parsed) return NextResponse.json({ ok: false, reason: "no-cookie" }, { status: 204 })
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data, error } = await supa.from("intakes").select("*").eq("id", parsed.id).eq("token_hash", hashToken(parsed.token)).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ ok: false, reason: "not-found" }, { status: 204 })
  return NextResponse.json({ ok: true, intake: data })
}
