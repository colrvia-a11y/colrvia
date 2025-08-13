// tests/api/stories-guest.test.ts
import { describe, it, expect, vi } from 'vitest'
import * as storiesRoute from '@/app/api/stories/route'

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: () => ({
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
    from: () => ({ insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) })
  })
}))

vi.mock('@/lib/ai/palette', () => ({
  seedPaletteFor: () => [{ brand: 'sherwin_williams', code: 'SW 7005', name: 'Pure White', hex: '#FEFEFE' }],
}))
vi.mock('@/lib/ai/orchestrator', () => ({
  designPalette: () => ({ swatches: [], placements: { primary: 60, secondary: 30, accent: 10, trim: 5, ceiling: 5 } }),
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

describe('/api/stories guest access', () => {
  it('returns story when unauthenticated', async () => {
    const req = new Request('http://localhost/api/stories', { method: 'POST', body: JSON.stringify({ brand: 'sherwin_williams', vibe: 'Cozy Neutral' }) })
    const res = await storiesRoute.POST(req as any)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.story).toBeDefined()
    expect(json.story.id).toBeNull()
    expect(Array.isArray(json.story.palette)).toBe(true)
  })
})
