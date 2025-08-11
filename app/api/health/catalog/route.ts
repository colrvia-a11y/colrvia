// app/api/health/catalog/route.ts
import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type CountResult = Record<string, number>

export async function GET(_req: Request) {
  const supabase = supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const tables = ["stories", "story_variants"]
  const counts: CountResult = {}

  for (const t of tables) {
    try {
      const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true })
      counts[t] = error ? 0 : Number(count ?? 0)
    } catch {
      counts[t] = 0
    }
  }

  return NextResponse.json({
    ok: true,
    at: new Date().toISOString(),
    userId: user.id,
    counts,
    version: process.env.VERCEL_GIT_COMMIT_SHA || "dev",
  })
}
