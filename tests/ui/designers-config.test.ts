import { describe, it, expect } from 'vitest'
import { designers } from '@/lib/ai/designers'

describe('designers config', () => {
  it('each designer has a heroImage', () => {
    for (const d of designers) {
      expect(typeof d.heroImage).toBe('string')
      expect(d.heroImage.length).toBeGreaterThan(0)
    }
  })
})
