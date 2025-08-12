import { describe, it, expect } from 'vitest'
import { ensureContrast, contrastRatio, deltaEHex } from '@/lib/ai/color'
import { makeVariant } from '@/lib/ai/variants'

const sampleBase = [
  { role:'walls', name:'Walls', code:'W1', brand:'SW', hex:'#d2c7bb', tags:[] },
  { role:'trim', name:'Trim', code:'T1', brand:'SW', hex:'#f5f4f1', tags:[] },
  { role:'accent', name:'Accent', code:'A1', brand:'SW', hex:'#4a6a5a', tags:[] }
] as any

describe('contrast helpers', () => {
  it('ensureContrast increases ratio to target', () => {
    const res = ensureContrast('#aaaaaa', '#b0b0b0', 3)
    expect(contrastRatio(res.a, res.b)).toBeGreaterThanOrEqual(3)
  })
})

describe('deltaE', () => {
  it('returns 0 for identical colors', () => {
    expect(deltaEHex('#ffffff', '#ffffff')).toBeCloseTo(0, 5)
  })
  it('is symmetric and increases with difference', () => {
    const near = deltaEHex('#000000', '#010101')
    const far = deltaEHex('#000000', '#ffffff')
    expect(deltaEHex('#000000', '#ffffff')).toBeCloseTo(deltaEHex('#ffffff', '#000000'), 5)
    expect(far).toBeGreaterThan(near)
  })
})

describe('variants', () => {
  it('softer accent is lighter than base accent', () => {
    const softer = makeVariant(sampleBase, 'SW', 'softer')
  const baseAccent = sampleBase.find((s: any)=>s.role==='accent')!.hex
  const softAccent = softer.find((s: any)=>s.role==='accent')!.hex
    expect(softAccent).not.toBe(baseAccent)
  })
  it('bolder accent differs from base accent', () => {
    const bolder = makeVariant(sampleBase, 'SW', 'bolder')
  const baseAccent = sampleBase.find((s: any)=>s.role==='accent')!.hex
  const boldAccent = bolder.find((s: any)=>s.role==='accent')!.hex
    expect(boldAccent).not.toBe(baseAccent)
  })
  it('accent maintains perceptible deltaE from walls', () => {
    const softer = makeVariant(sampleBase, 'SW', 'softer')
    const walls = softer.find((s: any)=>s.role==='walls')!.hex
    const accent = softer.find((s: any)=>s.role==='accent')!.hex
    expect(deltaEHex(accent, walls)).toBeGreaterThan(10)
  })
})
