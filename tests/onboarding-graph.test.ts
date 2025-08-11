import { describe, it, expect } from 'vitest'
import { initialTurn, nextState, isTerminal } from '@/lib/ai/onboardingGraph'

describe('onboardingGraph', () => {
  it('walks through states deterministically', () => {
    let turn = initialTurn()
    expect(turn.state).toBe('start')
    const answers: any = {}
    const seq = [
      { a: 'yes', expect: 'ask-goal' },
      { a: 'Cozy Neutral', expect: 'ask-room' },
      { a: 'Living Room', expect: 'ask-light' },
      { a: 'bright north', expect: 'ask-brand' },
      { a: 'SW', expect: 'summary' },
      { a: '', expect: 'done' }
    ]
    let current = turn.state
    for (const step of seq) {
      const { next, update } = nextState(current, step.a, answers)
      if (update) Object.assign(answers, update)
      expect(next).toBe(step.expect)
      current = next
    }
    expect(isTerminal(current)).toBe(true)
    expect(answers.brand).toBe('SW')
  })
})
