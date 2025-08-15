// tests/api/variant-validation.test.ts
import { describe, it, expect, vi } from 'vitest'
import * as variantRoute from '@/app/api/stories/[id]/variant/route'

vi.mock('@/lib/supabase/server', () => {
  const client = () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { id: 's1', palette: [{ name: 'x', code: 'y', hex: '#ffffff', role: 'walls', brand: 'sherwin_williams' }], brand: 'sherwin_williams' },
            error: null,
          }),
        }),
      }),
    }),
  })
  return { supabaseServer: client, createSupabaseServerClient: client }
})

vi.mock('@/lib/ai/variants', () => ({
  makeVariant: (base: any) => base,
}))

vi.mock('@/lib/palette', async (orig) => {
  const actual = await (orig as any)()
  return {
    ...actual,
    normalizePalette: (input: any) => (Array.isArray(input) ? input : [{ name: 'White', code: 'W', hex: '#ffffff', role: 'walls', brand: 'sherwin_williams' }]),
  }
})

describe('/api/stories/[id]/variant validation', () => {
  it('400 on invalid JSON', async () => {
    const res = await variantRoute.POST(new Request('http://x', { method: 'POST', body: 'not-json' }) as any, { params: { id: 's1' } } as any)
    expect(res.status).toBe(400)
  })

  it('422 on invalid input (bad mode)', async () => {
    const res = await variantRoute.POST(
      new Request('http://x', { method: 'POST', body: JSON.stringify({ mode: 'LOUDER' }) }) as any,
      { params: { id: 's1' } } as any
    )
    expect(res.status).toBe(422)
  })

  it('200 on valid request (default recommended)', async () => {
    const res = await variantRoute.POST(
      new Request('http://x', { method: 'POST', body: JSON.stringify({}) }) as any,
      { params: { id: 's1' } } as any
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.variant)).toBe(true)
  })
})
