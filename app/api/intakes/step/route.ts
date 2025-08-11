export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { nextStep } from "@/lib/intake/engine"

export async function POST(req: Request) {
  const { sessionId, answer } = await req.json()
  if (!sessionId) return NextResponse.json({ error:"session_required" }, { status: 400 })
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: session } = await supa.from("intake_sessions").select("*").eq("id", sessionId).single()
  const { data: flow } = await supa.from("intake_flows").select("nodes").eq("slug", session.flow_slug).eq("version", session.flow_version).maybeSingle()
  const step = nextStep(flow?.nodes, { answers: session.answers, current: session.current_node! }, session.current_node!, answer)

  if (step.type === "question") {
    const answers = { ...session.answers }
    const node = (flow!.nodes as any)[session.current_node!]
    if (node?.key) {
      const v = Array.isArray(answer) ? answer : String(answer ?? "")
      answers[node.key] = v
    }
    await supa.from("intake_sessions").update({ answers, current_node: step.node.id }).eq("id", sessionId)
  } else {
    await supa.from("intake_sessions").update({ status:"done", current_node: null }).eq("id", sessionId)
  }
  return NextResponse.json({ step })
}
