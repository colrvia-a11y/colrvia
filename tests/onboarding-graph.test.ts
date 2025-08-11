import { describe, it, expect } from 'vitest'
import { startState, acceptAnswer, getNode, normalizeAnswer } from '@/lib/ai/onboardingGraph'

describe('onboardingGraph', () => {
  it('walks through all nodes until done', () => {
    let s = startState()
    const inputs = {
      space: 'Living room',
      lighting: 'Bright',
      vibe: 'Calm Cozy',
      contrast: 'Balanced',
      fixed: 'Oak floors',
      avoid: 'Yellow',
      trim: 'Clean white',
      brand: 'Sherwin-Williams'
    }
    Object.values(inputs).forEach(val => { s = acceptAnswer(s, val as string) })
    expect(s.done).toBe(true)
  })
  it('normalizes single_select with fuzzy match', () => {
    const n: any = getNode('lighting')
    expect(normalizeAnswer('br', n)).toBe('Bright')
    expect(normalizeAnswer('low', n)).toBe('Low')
  })
  it('respects multi_select max', () => {
    const n: any = getNode('vibe')
    const v = normalizeAnswer('Calm Cozy Airy', n) as string[]
    expect(v.length).toBeLessThanOrEqual(n.max!)
  })
})
