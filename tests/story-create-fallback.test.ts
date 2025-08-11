import { describe, it, expect, vi, beforeAll } from 'vitest'

// This test will simulate calling the API route handler directly.
import * as paletteModule from '@/lib/ai/palette'
import { POST } from '@/app/api/stories/route'

// Mock supabase server client used in route
vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }) },
    from: () => ({
      insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'story-1' }, error: null }) }) })
    })
  })
}))

// Mock palette builder to return empty swatches triggering fallback
vi.spyOn(paletteModule, 'buildPalette').mockImplementation(() => ({ swatches: [] as any, placements: { pct:{sixty:60,thirty:30,ten:10} } as any }))

// Mock seedPaletteFor to return empty to force repair code path
vi.spyOn(paletteModule, 'seedPaletteFor').mockImplementation(() => [])

// Mock normalizePaletteOrRepair to ensure it supplies 5 swatches
vi.mock('@/lib/palette/normalize-repair', () => ({
  normalizePaletteOrRepair: async () => [
    { brand:'sherwin_williams', code:'SW 7008', name:'Alabaster', hex:'#FFFFFF' },
    { brand:'sherwin_williams', code:'SW 7036', name:'Accessible Beige', hex:'#E5D8C8' },
    { brand:'sherwin_williams', code:'SW 7043', name:'Worldly Gray', hex:'#D8D4CE' },
    { brand:'sherwin_williams', code:'SW 6204', name:'Sea Salt', hex:'#CDD8D2' },
    { brand:'sherwin_williams', code:'SW 7005', name:'Pure White', hex:'#FEFEFE' },
  ]
}))

describe('story create fallback', () => {
  it('returns id and builds 5-swatch palette when builder empty', async () => {
    const req = new Request('http://localhost/api/stories', { method:'POST', body: JSON.stringify({ brand:'SW', designerKey:'marisol', vibe:'Cozy Neutral' }) })
    const res = await POST(req as any)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.id).toBe('story-1')
  })
})
