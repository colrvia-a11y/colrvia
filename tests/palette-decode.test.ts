import { describe, it, expect } from 'vitest'
import { decodePalette } from '@/lib/palette'

describe('decodePalette', () => {
  it('passes through simple array', () => {
    const input = [{ hex:'#FFFFFF', name:'White' }]
    const out = decodePalette(input)
    expect(out.length).toBe(1)
    expect(out[0].hex).toBe('#FFFFFF')
  })
  it('handles colors property', () => {
    const input = { colors:[{ hex:'fff' }, { hex:'000000' }] }
    const out = decodePalette(input)
    expect(out.length).toBe(2)
    expect(out[0].hex).toBe('#FFFFFF')
  })
  it('flattens role objects', () => {
    const input = { primary:{ hex:'#123123', name:'Primary' }, secondary:{ hex:'#456456' }, accent:{ hex:'#789789' } }
    const out = decodePalette(input)
    expect(out.length).toBe(3)
  })
  it('returns empty on garbage', () => {
    const out = decodePalette('nope')
    expect(out.length).toBe(0)
  })
})
