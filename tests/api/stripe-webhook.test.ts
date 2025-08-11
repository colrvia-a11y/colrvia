import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase admin
vi.mock("@/lib/supabase/admin", () => {
  const rows: any[] = []
  return {
    supabaseAdmin: () => ({
      from: (_: string) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null })
          })
        }),
        insert: async (r: any) => {
          rows.push(r)
          return { error: null }
        }
      })
    })
  }
})

// Mock Stripe and signature verification
vi.mock("@/lib/stripe", () => {
  class DummyWebhooks {
    constructEvent(body: string, _sig: string, _secret: string) {
      const parsed = JSON.parse(body)
      return parsed
    }
  }
  return {
    getStripe: () => ({ webhooks: new (DummyWebhooks as any)() })
  }
})

import * as route from "@/app/api/stripe/webhook/route"

beforeEach(() => {
  vi.unstubAllEnvs()
})

describe("Stripe webhook route", () => {
  it("returns 500 when webhook secret missing", async () => {
    vi.unstubAllEnvs()
    const res = await route.POST(new Request("http://localhost/api/stripe/webhook", { method: "POST", body: "{}" }))
    expect(res.status).toBe(500)
  })

  it("accepts a valid, unprocessed event and records it", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x")
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_x")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321")
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service_role_x")

    const event = { id: "evt_123", type: "checkout.session.completed", data: { object: {} }, created: 1_700_000_000 }
    const res = await route.POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "t=sig" },
        body: JSON.stringify(event),
      })
    )
    expect(res.status).toBe(200)
  })
})
