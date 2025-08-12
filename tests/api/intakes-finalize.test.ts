import { describe, it, expect, vi } from 'vitest'

vi.mock('@supabase/supabase-js', () => {
  const session = { id: 'sess-1', answers: { brand: 'Not sure', lighting: 'Not sure', vibe: 'Not sure', room: 'Not sure' } }
  const guideline = { config: { contrast: 'balanced' }, designer_id: 'd1', brand: 'Sherwin-Williams' }
  return {
    createClient: () => ({
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: table === 'intake_sessions' ? session : null, error: null }),
            maybeSingle: async () => ({ data: table === 'palette_guidelines' ? guideline : null, error: null })
          })
        })
      })
    })
  }
})

vi.mock('@/lib/ai/orchestrator', () => ({
  designPalette: vi.fn(async () => ({ swatches: [], placements: { primary: 60, secondary: 30, accent: 10, trim: 5, ceiling: 5 } }))
}))

import { POST } from '@/app/api/intakes/finalize/route'

describe('intakes finalize', () => {
  it('handles "Not sure" answers gracefully', async () => {
    const res = await POST(new Request('http://x', { method: 'POST', body: JSON.stringify({ sessionId: 'sess-1' }) }))
    const data = await res.json()
    expect(data.input).toEqual({
      brand: 'Sherwin-Williams',
      lighting: 'Mixed',
      vibe: [],
      space: 'Living Room',
      contrast: 'balanced',
      seed: 'sess:sess-1'
    })
  })
})
