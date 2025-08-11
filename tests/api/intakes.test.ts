import { describe, it, expect, vi } from "vitest"

vi.mock("@supabase/supabase-js", () => {
  const flow = { slug:"default", version:1, nodes: {
    start:{ id:"start", type:"single", key:"brand", question:"Brand?", options:["Sherwin-Williams","Behr"], next:"lighting" },
    lighting:{ id:"lighting", type:"single", key:"lighting", question:"Light?", options:["Low","Mixed","Bright"], next:"done" },
    done:{ id:"done", type:"end" }
  }}
  let session:any = null
  return {
    createClient: () => ({
      from: (table:string) => {
        if(table === "intake_flows"){
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: flow, error: null })
                })
              })
            })
          }
        }
        if(table === "intake_sessions"){
          return {
            select: () => ({
              eq: () => ({ single: async () => ({ data: session, error: null }) })
            }),
            insert: (obj:any) => ({
              select: () => ({
                single: async () => {
                  session = { ...obj, id: "sess-1", answers:{}, current_node:"start", flow_slug:"default", flow_version:1 }
                  return { data: session, error: null }
                }
              })
            }),
            update: () => ({ eq: () => ({}) })
          }
        }
        return {}
      }
    })
  }
})

describe("intakes API", () => {
  it("starts and steps", async () => {
    const start = await import("@/app/api/intakes/start/route")
    const r1 = await start.POST(new Request("http://x", { method:"POST", body: JSON.stringify({ designerId:"therapist" }) }) as any)
    const j1 = await (r1 as Response).json()
    expect(j1.sessionId).toBeTruthy()
    const step = await import("@/app/api/intakes/step/route")
    const r2 = await step.POST(new Request("http://x", { method:"POST", body: JSON.stringify({ sessionId: j1.sessionId, answer:"Behr" }) }) as any)
    const j2 = await (r2 as Response).json()
    expect(j2.step.type).toBe("question")
  })
})
