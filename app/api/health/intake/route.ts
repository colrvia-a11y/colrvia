// app/api/health/intake/route.ts
export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !key) return NextResponse.json({ ok: false, error: "Missing Supabase envs" }, { status: 500 })

  const supa = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const [flows, sessions, guides] = await Promise.all([
    supa.from("intake_flows").select("id", { count: "exact", head: true }),
    supa.from("intake_sessions").select("id", { count: "exact", head: true }),
    supa.from("palette_guidelines").select("id", { count: "exact", head: true }),
  ])
  return NextResponse.json({
    ok: true,
    counts: {
      flows: (flows as any).count ?? 0,
      sessions: (sessions as any).count ?? 0,
      guidelines: (guides as any).count ?? 0,
    },
  })
}
