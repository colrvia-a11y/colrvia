import { describe, it, expect, vi } from "vitest"

vi.mock("@supabase/supabase-js", () => {
  const flow = { slug:"default", version:1, nodes: {
    start:{ id:"start", type:"single", key:"room_type", question:"Which room?", options:["Foyer","Living","Dining","Kitchen","Pantry","Breakfast Nook","Bedroom","Kid's Room","Nursery","Home Office","Bathroom","Powder Room","Laundry/Mudroom","Hallway","Stairwell","Loft/Bonus","Media Room","Sunroom","Basement","Gym","Closet","Garage","Other"], next:"primary_use" },
    primary_use:{ id:"primary_use", type:"multi", key:"primary_use", question:"Top uses (pick up to 3)", options:["Relax","Work/Study","Entertain","Sleep","Play","Eat","Cook","Get ready","Laundry","Storage","Exercise","Other"], max:3, next:"desired_vibe" },
    desired_vibe:{ id:"desired_vibe", type:"single", key:"desired_vibe", question:"Desired vibe", options:["Calm","Airy","Cozy","Focused","Luxe","Energizing","Grounded","Fresh","Moody"], next:"avoid_vibe" },
    avoid_vibe:{ id:"avoid_vibe", type:"single", key:"avoid_vibe", question:"Vibe you do NOT want", next:"lighting" },
    lighting:{ id:"lighting", type:"single", key:"lighting", question:"How is the lighting? (e.g., lots of daylight, warm artificial light)", next:"room_photos" },
    room_photos:{ id:"room_photos", type:"multi", key:"room_photos", question:"Room photos (8am/noon/4pm; lights off + on)", helper:"Daylight near a window; include one shot with white paper for reference.", next:"existing_elements_desc" },
    existing_elements_desc:{ id:"existing_elements_desc", type:"single", key:"existing_elements_desc", question:"Describe key existing items (optional)", next:"existing_elements_photos" },
    existing_elements_photos:{ id:"existing_elements_photos", type:"multi", key:"existing_elements_photos", question:"Photos of existing items", next:"done" },
    done:{ id:"done", type:"end" }
  }}
  let session:any = null
  const flowQuery = { eq: () => flowQuery, maybeSingle: async () => ({ data: flow, error: null }) }
  const sessionQuery = { eq: () => sessionQuery, single: async () => ({ data: session, error: null }) }
  return {
    createClient: () => ({
      from: (table:string) => ({
        select: () => (table === "intake_flows" ? flowQuery : sessionQuery),
        insert: (obj:any) => ({
          select: () => ({
            single: async () => {
              session = { ...obj, id: "sess-1", answers:{}, current_node:"start", flow_slug:"default", flow_version:1 }
              return { data: session, error: null }
            }
          })
        }),
        update: () => ({ eq: () => ({}) })
      })
    })
  }
})

describe("intakes API", () => {
  it("starts and steps", async () => {
    const start = await import("@/app/api/intakes/start/route")
    const r1 = await start.POST(new Request("http://x", { method:"POST", body: JSON.stringify({ designerId:"therapist" }) }) as any)
    const j1 = await (r1 as Response).json()
    expect(j1.step.node.question).toBe("Which room?")
    const step = await import("@/app/api/intakes/step/route")
    const r2 = await step.POST(new Request("http://x", { method:"POST", body: JSON.stringify({ sessionId: j1.sessionId, answer:"Living" }) }) as any)
    const j2 = await (r2 as Response).json()
    expect(j2.step.type).toBe("question")
  })
})
