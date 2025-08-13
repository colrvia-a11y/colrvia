import { describe, it, expect } from 'vitest'
import { calcCostUSD } from '@/lib/metrics/calc'

describe('calcCostUSD', () => {
  it('estimates cost with explicit in/out tokens', () => {
    const r = calcCostUSD('gpt-4o-mini', { input_tokens: 1000, output_tokens: 500 })
    expect(r.costUSD).toBeGreaterThan(0)
    expect(r.inputTokens).toBe(1000)
    expect(r.outputTokens).toBe(500)
  })
  it('apportions total_tokens when individual counts missing', () => {
    const r = calcCostUSD('gpt-4o-mini', { total_tokens: 800 })
    expect(r.inputTokens + r.outputTokens).toBe(800)
    expect(r.costUSD).toBeGreaterThan(0)
  })
})
