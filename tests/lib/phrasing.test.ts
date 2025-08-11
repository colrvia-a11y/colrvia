import { describe, it, expect } from 'vitest'
import { ackFor, askFor, buildStartUtterance } from '@/lib/ai/phrasing'
import { designers } from '@/lib/ai/designers'
import { getNode } from '@/lib/ai/onboardingGraph'

describe('phrasing', () => {
  const seed = 'test-seed'
  it('deterministic start utterance per seed', () => {
    const a = buildStartUtterance(designers[0].id, seed, 'Which space are we working on?')
    const b = buildStartUtterance(designers[0].id, seed, 'Which space are we working on?')
    expect(a).toBe(b)
  })
  it('ack gives hint for lighting', () => {
    const node = getNode('lighting')
    const ack = ackFor('lighting', 'Bright', seed)
    expect(ack.toLowerCase()).toContain('bright')
  })
  it('ask templating injects prompt', () => {
    const node = getNode('contrast')
    const ask = askFor(node, seed)
    expect(ask.toLowerCase()).toContain('contrast')
  })
})
