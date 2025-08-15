import { describe, it, expect } from "vitest"
import { getSupabaseAdminClient, supabaseAdmin } from "@/lib/supabase/admin"

describe("admin exports", () => {
  it("supabaseAdmin is a function alias to getSupabaseAdminClient", () => {
    expect(typeof supabaseAdmin).toBe("function")
    expect(supabaseAdmin).toBe(getSupabaseAdminClient)
  })
})
