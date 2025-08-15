import { describe, it, expect } from 'vitest'
import { normalizeBrand } from '@/lib/brand'

describe('normalizeBrand', () => {
  it('maps common SW variants', () => {
    expect(normalizeBrand('SW')).toBe('sherwin_williams')
    expect(normalizeBrand('Sherwin-Williams')).toBe('sherwin_williams')
    expect(normalizeBrand('sherwin williams')).toBe('sherwin_williams')
    expect(normalizeBrand('sherwin')).toBe('sherwin_williams')
  })
  it('maps Behr variants', () => {
    expect(normalizeBrand('Behr')).toBe('behr')
    expect(normalizeBrand('behr_paint')).toBe('behr')
  })
  it('defaults to sherwin_williams when missing/unrecognized', () => {
    expect(normalizeBrand('')).toBe('sherwin_williams')
    // @ts-expect-error – testing null/undefined tolerance
    expect(normalizeBrand(undefined)).toBe('sherwin_williams')
  })
})

