import { describe, it, expect, vi } from 'vitest'
import { repairStoryPalette } from '@/lib/palette/repair'
import * as React from 'react'
;(globalThis as any).React = React

vi.mock('@/lib/palette/repair', () => ({ repairStoryPalette: vi.fn(async () => ({ ok:true })) }))
vi.mock('next/link', () => ({ default: ()=> null }))
vi.mock('@/components/reveal/StoryActionBar', () => ({ default: ()=> null }))
vi.mock('@/components/reveal/PaletteGrid', () => ({ default: ()=> null }))
vi.mock('@/components/reveal/CopyToast', () => ({ default: ()=> null }))
vi.mock('@/components/visual/StoryHeroCard', () => ({ default: ()=> null }))
vi.mock('@/components/visual/SwatchRibbon', () => ({ default: ()=> null }))
vi.mock('./pdf-button', () => ({ default: ()=> null }))
vi.mock('@/app/reveal/[id]/RevealPaletteClient', () => ({ default: ()=> null }))
vi.mock('@/app/reveal/[id]/variant-tabs', () => ({ default: ()=> null }))
vi.mock('@/app/reveal/[id]/reveal-client', () => ({ default: ()=> null }))
vi.mock('@/lib/palette', () => ({ normalizePalette: () => { throw new Error('invalid') } }))

vi.mock('@/lib/supabase/server', () => ({
  supabaseServer: () => {
    let first = true
    const repaired = [
      { brand:'sherwin_williams', code:'SW 7008', name:'Alabaster', hex:'#FFFFFF' },
      { brand:'sherwin_williams', code:'SW 7036', name:'Accessible Beige', hex:'#E5D8C8' },
      { brand:'sherwin_williams', code:'SW 7043', name:'Worldly Gray', hex:'#D8D4CE' },
      { brand:'sherwin_williams', code:'SW 6204', name:'Sea Salt', hex:'#CDD8D2' },
      { brand:'sherwin_williams', code:'SW 7005', name:'Pure White', hex:'#FEFEFE' },
    ]
    return {
      auth: { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }) },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => {
          if(first){ first=false; return { data: { id:'story-x', palette: [], vibe:'Cozy Neutral', brand:'sherwin_williams' }, error: null } }
          return { data: { id:'story-x', palette: repaired, vibe:'Cozy Neutral', brand:'sherwin_williams' }, error: null }
        } }) })
      })
    }
  }
}))

vi.mock('@/lib/palette/normalize-repair', () => ({ normalizePaletteOrRepair: async () => [
  { brand:'sherwin_williams', code:'SW 7008', name:'Alabaster', hex:'#FFFFFF' },
  { brand:'sherwin_williams', code:'SW 7036', name:'Accessible Beige', hex:'#E5D8C8' },
  { brand:'sherwin_williams', code:'SW 7043', name:'Worldly Gray', hex:'#D8D4CE' },
  { brand:'sherwin_williams', code:'SW 6204', name:'Sea Salt', hex:'#CDD8D2' },
  { brand:'sherwin_williams', code:'SW 7005', name:'Pure White', hex:'#FEFEFE' },
] }))

// Instead of rendering the full page (which requires React in SSR env), we
// import the module to trigger its top-level code paths and then directly
// invoke repairStoryPalette via simulated invalid palette scenario.
describe('repair on reveal', () => {
  it('invokes repairStoryPalette for invalid palette', async () => {
    const mod = await import('@/app/reveal/[id]/page')
    const Page = mod.default as any
    await Page({ params:{ id:'story-x' } })
    expect(repairStoryPalette).toHaveBeenCalled()
  })
})
