import { describe, it, expect } from 'vitest'
import { nodes } from '@/lib/ai/onboardingGraph'
import { QUESTION_SECTIONS } from '@/lib/ai/sections'

describe('POST /api/ai/onboarding', () => {
  it('works without OPENAI_API_KEY (fallback phrasing)', async () => {
    const req = new Request('http://localhost/api/ai/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ designerId: 'minimalist', step: 'start' })
    })
    const mod = await import('../../app/api/ai/onboarding/route')
    const resp = await (mod as any).POST(req as any)
    const json = await resp.json()
  expect(json.state).toBeTruthy()
  expect(typeof json.utterance).toBe('string')
  expect(typeof json.state.rngSeed).toBe('string')
  })

  it('maps all questions to a section', () => {
    nodes.forEach(n => {
      expect(QUESTION_SECTIONS[n.key]).toBeTruthy()
    })
  })
})
