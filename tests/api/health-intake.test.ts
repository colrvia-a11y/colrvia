import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: () => ({
      from: () => ({
        select: () => ({ count: 1 })
      })
    })
  }
})

beforeEach(() => {
  vi.unstubAllEnvs()
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321")
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service_role_test")
})

describe("/api/health/intake", () => {
  it("returns ok with counts", async () => {
    const mod = await import("@/app/api/health/intake/route")
    // @ts-ignore
    const res = await mod.GET()
    const json = await (res as Response).json()
    expect(json.ok).toBe(true)
    expect(json.counts.flows).toBeDefined()
  })
})
