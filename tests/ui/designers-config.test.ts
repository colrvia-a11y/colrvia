import { describe, it, expect } from 'vitest'
import { designers, DEFAULT_DESIGNER_ID, isDesignerLocked } from '@/lib/ai/designers'

describe('designers config', () => {
  it('each designer has a heroImage', () => {
    for (const d of designers) {
      expect(typeof d.heroImage).toBe('string')
      expect(d.heroImage.length).toBeGreaterThan(0)
    }
  })
  it('has a default designer and gating works', () => {
    const def = designers.find(d=>d.id===DEFAULT_DESIGNER_ID)
    expect(def).toBeTruthy()
    expect(def?.pro).toBeFalsy()
    const proOne = designers.find(d=>d.pro)
    if (proOne) {
      expect(isDesignerLocked('free', proOne.id)).toBe(true)
      expect(isDesignerLocked('pro', proOne.id)).toBe(false)
    }
  })
})
