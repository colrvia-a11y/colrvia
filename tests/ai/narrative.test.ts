import { describe, it, expect } from 'vitest'
import { buildDeterministicNarrative } from '@/lib/ai/narrative'

describe('narrative', () => {
  it('builds a compact explanation from palette + inputs', () => {
    const text = buildDeterministicNarrative({
      input: { contrast: 'Balanced', lighting: 'Mixed', vibe: ['Calm','Cozy'], brand: 'Sherwin-Williams' },
      palette: [
        { role:'walls', name:'Alabaster', code:'SW 7008', brand:'sherwin_williams', hex:'#FFFFFF' },
        { role:'cabinets', name:'Mega Greige', code:'SW 7031', brand:'sherwin_williams', hex:'#DDDDDD' },
        { role:'accent', name:'Naval', code:'SW 6244', brand:'sherwin_williams', hex:'#112233' },
        { role:'trim', name:'Pure White', code:'SW 7005', brand:'sherwin_williams', hex:'#F0F0F0' },
        { role:'extra', name:'Ceiling Bright White', code:'SW 7007', brand:'sherwin_williams', hex:'#F4F4F2' },
      ]
    })
    expect(typeof text).toBe('string')
    expect(text.length).toBeGreaterThan(20)
    expect(text.split('.').length).toBeLessThanOrEqual(4)
  })
})
