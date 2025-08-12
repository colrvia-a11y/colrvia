import { describe, it, expect } from 'vitest'

function contrast(hex1: string, hex2: string) {
  const toRgb = (hex: string) => {
    const h = hex.replace('#', '')
    const r = parseInt(h.slice(0,2),16)/255
    const g = parseInt(h.slice(2,4),16)/255
    const b = parseInt(h.slice(4,6),16)/255
    const lin = (c:number)=> c<=0.04045? c/12.92 : Math.pow((c+0.055)/1.055, 2.4)
    const L = 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b)
    return L
  }
  const L1 = toRgb(hex1), L2 = toRgb(hex2)
  const [hi, lo] = [Math.max(L1,L2), Math.min(L1,L2)]
  return (hi + 0.05) / (lo + 0.05)
}

describe('theme-moss tokens meet WCAG AA', () => {
  const BG = '#404934'
  it('primary text on moss ≥ 4.5:1', () => {
    expect(contrast(BG, '#F7F7F2')).toBeGreaterThanOrEqual(4.5)
  })
  it('muted text on moss ≥ 4.5:1', () => {
    expect(contrast(BG, '#cbd5e1')).toBeGreaterThanOrEqual(4.5)
  })
})
