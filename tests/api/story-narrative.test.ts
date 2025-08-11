import { describe, it, expect, vi } from 'vitest'

// Ensure env vars present so route handler does not early-return empty string
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test.local'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: () => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: { narrative: 'Short, friendly explanation.' }, error: null })
          })
        })
      })
    })
  }
})

describe('GET /api/stories/[id]/narrative', () => {
  it('returns narrative text', async () => {
    const mod = await import('../../app/api/stories/[id]/narrative/route')
    const r = await mod.GET(new Request('http://localhost/api/stories/abc/narrative') as any, { params: { id: 'abc' } } as any)
    const j = await (r as Response).json()
    expect(typeof j.narrative).toBe('string')
    expect(j.narrative.length).toBeGreaterThan(5)
  })
})
