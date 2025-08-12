import { describe, it, expect } from 'vitest'
import { seedPaletteFor } from '@/lib/ai/palette'

describe('seedPaletteFor', () => {
  it('accepts long brand names like "sherwin_williams"', () => {
    const swatches = seedPaletteFor({ brand: 'sherwin_williams' })
    expect(swatches.length).toBe(5)
  })
})
