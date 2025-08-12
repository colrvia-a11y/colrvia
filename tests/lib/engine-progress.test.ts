import { describe, it, expect } from 'vitest'
import { countAllFields, countAnsweredFields } from '@/lib/engine'

describe('engine progress counters', () => {
  it('only counts fields whose show_if matches', () => {
    const base = countAllFields({ answers: {} } as any)
    const withWhite = countAllFields({ answers: { need_white_match: true } } as any)
    expect(withWhite).toBe(base + 1)
  })

  it('counts only answered fields that are visible', () => {
    const state = { answers: { need_white_match: true, white_brand_known: true, white_brand_code: 'SW001' } } as any
    expect(countAnsweredFields(state)).toBe(3)
    const hidden = { answers: { white_brand_code: 'SW001' } } as any
    expect(countAnsweredFields(hidden)).toBe(0)
  })
})
