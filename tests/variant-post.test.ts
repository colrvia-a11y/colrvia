import { describe, it, expect } from 'vitest'
import { decodePalette } from '@/lib/palette'

// These are unit-level tests of decoder logic; route integration would require mocking Supabase.

describe('variant POST contract (decoder side)', () => {
  it('rejects non-array palette via decodePalette -> []', () => {
    const out = decodePalette({ not:'an array' })
    expect(out.length).toBe(0)
  })
  it('accepts array palette', () => {
    const out = decodePalette([{ hex:'#ffffff', role:'walls', name:'White', code:'W', brand:'SW' }])
    expect(out.length).toBe(1)
  })
})
