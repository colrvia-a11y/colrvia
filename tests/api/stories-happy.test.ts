// tests/api/stories-happy.test.ts
import { describe, it, expect, vi } from "vitest"
import * as storiesRoute from "@/app/api/stories/route"

vi.mock("@/lib/supabase/server", () => ({
  supabaseServer: () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u1" } }, error: null }) },
    from: () => ({
      insert: (_: any) => ({
        select: () => ({
          single: async () => ({ data: { id: "s1" }, error: null }),
        }),
      }),
    }),
  }),
}))

vi.mock("@/lib/palette/normalize-repair", () => ({
  normalizePaletteOrRepair: async (p: any) => p,
}))
vi.mock("@/lib/ai/palette", () => ({
  seedPaletteFor: async (_brand: string, _seed: string) => [{ hex: "#ffffff" }],
  buildPalette: async (base: any) => base,
}))

describe("/api/stories happy path", () => {
  it("returns 200 + id on valid input", async () => {
    const req = new Request("http://localhost/api/stories", {
      method: "POST",
      body: JSON.stringify({ prompt: "small condo entryway", brand: "sherwin_williams" }),
    })
    const res = await storiesRoute.POST(req as any)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.id).toBe("s1")
  })
})
