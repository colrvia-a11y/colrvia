import { describe, it, expect } from 'vitest'
import { normalizePalette } from '@/lib/palette'

describe('story creation palette', () => {
  it('normalizer works on seed fallback (unit-level)', () => {
    const seed = [
      { name:'Walls', code:'W1', role:'walls', brand:'behr' },
      { name:'Trim', code:'T1', role:'trim', brand:'behr' },
      { name:'Cabs', code:'C1', role:'cabinets', brand:'behr' },
      { name:'Accent', code:'A1', role:'accent', brand:'behr' },
      { name:'Extra', code:'E1', role:'extra', brand:'behr' }
    ]
    const arr = normalizePalette(seed, 'behr')
    expect(arr.length).toBeGreaterThan(0)
    expect(arr[0].role).toBe('walls')
  })
})
