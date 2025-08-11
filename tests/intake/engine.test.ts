import { describe, it, expect } from "vitest"
import { startFlow, nextStep } from "@/lib/intake/engine"

const flow = {
  start:{ id:"start", type:"single", key:"brand", question:"Brand?", options:["Sherwin-Williams","Behr"], next:"lighting" },
  lighting:{ id:"lighting", type:"single", key:"lighting", question:"Light?", options:["Low","Mixed","Bright"], next:{ if:[{ when:{ "==":[{ "var":"answers.brand" },"Behr"] }, to:"room"}], else:"vibe" } },
  vibe:{ id:"vibe", type:"multi", key:"vibe", question:"Vibe?", options:["Calm","Bold"], max:2, next:"room" },
  room:{ id:"room", type:"single", key:"room", question:"Room?", options:["Living Room","Bedroom"], next:"done" },
  done:{ id:"done", type:"end" }
}

describe("engine", () => {
  it("walks through questions then ends", () => {
    const s1 = startFlow(flow)
    expect(s1.type).toBe("question")
    const s2 = nextStep(flow, { answers:{} }, "start", "Behr")
    expect(s2.type).toBe("question")
    const s3 = nextStep(flow, { answers:{ brand:"Behr" } }, "lighting", "Low")
    expect(s3.type).toBe("question")
    const s4 = nextStep(flow, { answers:{ brand:"Behr", lighting:"Low" } }, "room", "Living Room")
    expect(s4.type).toBe("done")
  })
})
