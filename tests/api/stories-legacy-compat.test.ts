import { describe, it, expect, vi } from 'vitest'

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
        insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'story-1' }, error: null }) }) }),
        select: () => ({ eq: () => ({ single: async () => ({ data: { id:'story-1', palette: swatches, vibe:'Cozy Neutral', brand:'sherwin_williams' }, error: null }) }) })
      })
    }
  }
}))

const post = (json:any) => new Request('http://localhost/api/stories', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(json) })

describe('/api/stories legacy compatibility', () => {
  it('returns 422 for invalid palette_v2 when flag on', async () => {
    (process as any).env.AI_ALLOW_CLIENT_PALETTE = 'true'
    const mod = await import('../../app/api/stories/route')
    const resp = await mod.POST(post({ palette_v2: { swatches: [] } }) as any)
    expect((resp as Response).status).toBe(422)
  })
  it('maps orchestrator palette to legacy when no client palette', async () => {
    delete (process as any).env.AI_ALLOW_CLIENT_PALETTE
    const mod = await import('../../app/api/stories/route')
    const resp = await mod.POST(post({ brand:'SW', designerKey:'marisol', vibe:'Cozy Neutral' }) as any)
  const status = (resp as Response).status
  const json = await (resp as Response).json().catch(()=>({}))
  // Should not be the validation 422 path with error prefix 'Invalid palette:'
  const isValidationFailure = status === 422 && typeof json.error==='string' && json.error.startsWith('Invalid palette:')
  expect(isValidationFailure).toBe(false)
  })
})
