import { describe, it, expect } from 'vitest'
import { buildOgText } from '../lib/og'

describe('buildOgText', () => {
  it('provides fallbacks when empty', () => {
    const r = buildOgText({ title: '', subtitle: '' })
    expect(r.title).toBe('Colrvia Story')
    expect(r.subtitle).toBe('')
  })

  it('trims whitespace', () => {
    const r = buildOgText({ title: '  Hello  ', subtitle: '  World  ' })
    expect(r.title).toBe('Hello')
    expect(r.subtitle).toBe('World')
  })

  it('caps length with ellipsis', () => {
    const long = 'x'.repeat(200)
    const r = buildOgText({ title: long, subtitle: long, maxTitleLength: 10, maxSubtitleLength: 12 })
    expect(r.title.length).toBeLessThanOrEqual(10)
    expect(r.title.endsWith('…')).toBe(true)
    expect(r.subtitle.length).toBeLessThanOrEqual(12)
  })
})
