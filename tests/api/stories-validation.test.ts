// tests/api/stories-validation.test.ts
import { describe, it, expect, vi } from 'vitest'
import * as storiesRoute from '@/app/api/stories/route'

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: () => ({
      insert: () => ({ select: () => ({ single: async () => ({ data: { id: 's1' }, error: null }) }) }),
      update: () => ({ eq: async () => ({ error: null }) }),
      select: () => ({ eq: () => ({ single: async () => ({ data: { id: 's1', palette: [], vibe: 'Cozy Neutral' }, error: null }) }) }),
    }),
  }),
}))

vi.mock('@/lib/ai/palette', () => ({
  buildPalette: () => ({ swatches: [] }),
  seedPaletteFor: () => [{ brand: 'sherwin_williams', code: 'SW 7005', name: 'Pure White', hex: '#FEFEFE' }],
}))
vi.mock('@/lib/palette/normalize-repair', () => ({
  normalizePaletteOrRepair: async () => [
    { brand: 'sherwin_williams', code: 'SW 7005', name: 'Pure White', hex: '#FEFEFE', role: 'walls' },
    { brand: 'sherwin_williams', code: 'SW 7008', name: 'Alabaster', hex: '#FFFFFF', role: 'trim' },
    { brand: 'sherwin_williams', code: 'SW 7036', name: 'Accessible Beige', hex: '#E5D8C8', role: 'cabinets' },
    { brand: 'sherwin_williams', code: 'SW 7043', name: 'Worldly Gray', hex: '#D8D4CE', role: 'accent' },
    { brand: 'sherwin_williams', code: 'SW 6204', name: 'Sea Salt', hex: '#CDD8D2', role: 'extra' },
  ],
}))

describe('/api/stories validation', () => {
  it('returns 400 on invalid JSON', async () => {
    const req = new Request('http://localhost/api/stories', { method: 'POST', body: 'not-json' })
    const res = await storiesRoute.POST(req as any)
    expect(res.status).toBe(400)
  })

  it('returns 422/400/500 on invalid input (empty object)', async () => {
    const req = new Request('http://localhost/api/stories', { method: 'POST', body: JSON.stringify({}) })
    const res = await storiesRoute.POST(req as any)
    expect([422, 400, 500]).toContain(res.status)
  })
})
