import { describe, it, expect } from "vitest"

// These tests hit the route handlers directly.

describe("intakes API", () => {
  it("start → sets cookie and returns id", async () => {
    const mod = await import("../../app/api/intakes/start/route")
    const req = new Request("http://localhost/api/intakes/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ designerId: "pro" }) })
    const resp = await (mod as any).POST(req as any)
  const sc = (resp as Response).headers.get("set-cookie")
  expect(typeof sc === 'string' && /colrvia_intake=/i.test(sc)).toBe(true)
  })
  it("patch → requires cookie", async () => {
    const mod = await import("../../app/api/intakes/patch/route")
    const req = new Request("http://localhost/api/intakes/patch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: { answers: {}, currentKey: "space", done: false }, messages: [] }) })
    const resp = await (mod as any).POST(req as any)
    expect((resp as Response).status).toBe(401)
  })
})
