import { nluParse } from '@/lib/intake/nlu'

describe('nluParse', () => {
  it('maps style synonyms', () => {
    expect(nluParse('style_primary', 'Mid century modern')).toBe('midcentury')
  })

  it('maps light level synonyms', () => {
    expect(nluParse('light_level', 'lots of light')).toBe('bright')
    expect(nluParse('light_level', 'pretty dim')).toBe('low')
    expect(nluParse('light_level', 'changes through day')).toBe('varies')
  })

  it('maps dark stance synonyms', () => {
    expect(nluParse('dark_stance', 'no dark colors')).toBe('avoid')
    expect(nluParse('dark_stance', 'accents only')).toBe('accents')
    expect(nluParse('dark_stance', 'do it anywhere')).toBe('open')
    expect(nluParse('dark_stance', 'one feature wall')).toBe('walls')
  })

  it('maps dark location synonyms', () => {
    expect(nluParse('dark_locations', 'the trim and island')).toEqual(['trim', 'island'])
    expect(nluParse('dark_locations', 'feature wall')).toEqual(['walls'])
  })

  it('limits mood words to three', () => {
    expect(nluParse('mood_words', 'airy calm cozy bright')).toEqual(['airy', 'calm', 'cozy'])
  })

  it('handles not sure defaults', () => {
    expect(nluParse('window_aspect', 'not sure')).toBe('unknown')
    expect(nluParse('dark_stance', 'not sure')).toBe('open')
    expect(nluParse('fixed_details', 'not sure')).toBe('unsure')
  })
})
