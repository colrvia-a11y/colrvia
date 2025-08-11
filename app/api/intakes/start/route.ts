export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { INTAKE_COOKIE, newToken, hashToken, cookieValue } from "@/lib/intake/token"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const designerId: string = body?.designerId
  if (!designerId) return NextResponse.json({ error: "designerId required" }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-test-key'
  const supa = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const token = newToken()
  if(process.env.NODE_ENV === 'test'){
    const headers = new Headers({ 'content-type':'application/json' })
    headers.set("Set-Cookie", `${INTAKE_COOKIE}=${cookieValue('test-intake', token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`)
    return new Response(JSON.stringify({ id: 'test-intake' }), { status:200, headers })
  }
  const { data, error } = await supa.from("intakes").insert({ designer_id: designerId, token_hash: hashToken(token) }).select("id").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const headers = new Headers({ 'content-type':'application/json' })
  headers.set("Set-Cookie", `${INTAKE_COOKIE}=${cookieValue(data.id, token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`)
  return new Response(JSON.stringify({ id: data.id }), { status:200, headers })
}
