import { describe, it, expect, vi } from 'vitest'
import * as paletteModule from '@/lib/ai/palette'
import { POST } from '@/app/api/stories/route'

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: () => {
    const swatches = [
      { brand:'sherwin_williams', code:'SW 7008', name:'Alabaster', hex:'#FFFFFF' },
      { brand:'sherwin_williams', code:'SW 7036', name:'Accessible Beige', hex:'#E5D8C8' },
      { brand:'sherwin_williams', code:'SW 7043', name:'Worldly Gray', hex:'#D8D4CE' },
      { brand:'sherwin_williams', code:'SW 6204', name:'Sea Salt', hex:'#CDD8D2' },
      { brand:'sherwin_williams', code:'SW 7005', name:'Pure White', hex:'#FEFEFE' },
    ]
    return {
      auth: { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }) },
      from: () => ({
        insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'story-x' }, error: null }) }) }),
        select: () => ({ eq: () => ({ single: async () => ({ data: { id:'story-x', palette: swatches, vibe:'Cozy Neutral', brand:'sherwin_williams' }, error: null }) }) })
      })
    }
  }
}))

vi.mock('@/lib/palette/repair', () => ({ repairStoryPalette: async () => ({ ok:true }) }))
vi.mock('@/lib/palette/normalize-repair', () => ({ normalizePaletteOrRepair: async () => [
  { brand:'sherwin_williams', code:'SW 7008', name:'Alabaster', hex:'#FFFFFF' },
  { brand:'sherwin_williams', code:'SW 7036', name:'Accessible Beige', hex:'#E5D8C8' },
  { brand:'sherwin_williams', code:'SW 7043', name:'Worldly Gray', hex:'#D8D4CE' },
  { brand:'sherwin_williams', code:'SW 6204', name:'Sea Salt', hex:'#CDD8D2' },
  { brand:'sherwin_williams', code:'SW 7005', name:'Pure White', hex:'#FEFEFE' },
] }))

vi.spyOn(paletteModule, 'buildPalette').mockImplementation(()=> ({ swatches: [], placements:{ pct:{sixty:60,thirty:30,ten:10} } as any }))
vi.spyOn(paletteModule, 'seedPaletteFor').mockImplementation(()=> [])

describe('repair on create', () => {
  it('repairs empty palette after insert', async () => {
    const req = new Request('http://localhost/api/stories', { method:'POST', body: JSON.stringify({ brand:'SW', designerKey:'marisol', vibe:'Cozy Neutral' }) })
    const res = await POST(req as any)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.id).toBe('story-x')
  })
})
