export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { startFlow } from "@/lib/intake/engine"

export async function POST(req: Request) {
  const { designerId = "therapist", flowSlug = "default" } = await req.json().catch(()=> ({}))
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: flow } = await supa.from("intake_flows").select("slug,version,nodes").eq("slug", flowSlug).eq("is_active", true).maybeSingle()
  if (!flow) return NextResponse.json({ error:"no_active_flow" }, { status: 404 })
  const first = startFlow(flow.nodes)
  const { data: session } = await supa.from("intake_sessions").insert({
    user_id: null,
    designer_id: designerId,
    flow_slug: flow.slug,
    flow_version: flow.version,
    answers: {},
    current_node: first.type === "question" ? first.node.id : null
  }).select().single()
  return NextResponse.json({ sessionId: session.id, step: first })
}
