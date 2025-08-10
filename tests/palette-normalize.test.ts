import { describe, it, expect } from 'vitest'
import { normalizePalette, roleOrder } from '@/lib/palette'

describe('normalizePalette', () => {
  it('accepts already valid array', () => {
    const arr = normalizePalette([{ name:'A', code:'A', role:'walls', brand:'behr', hex:'#fff' }], 'behr')
    expect(arr[0].role).toBe('walls')
  })
  it('object with role keys', () => {
    const out = normalizePalette({ walls:{ name:'Walls', code:'W'}, trim:{ name:'Trim', code:'T'} }, 'sherwin_williams')
    expect(out.length).toBeGreaterThan(1)
    expect(out[0].role).toBe('walls')
  })
  it('colorN keys fallback', () => {
    const out = normalizePalette({ color1:{ name:'One', code:'1'}, color2:{ name:'Two', code:'2'} }, 'behr')
    expect(out[0].role).toBe(roleOrder[0])
  })
  it('string array wraps', () => {
    const out = normalizePalette(['A','B','C'], 'behr')
    expect(out[1].name).toBe('B')
  })
  it('throws on invalid', () => {
    expect(()=> normalizePalette(123,'behr')).toThrow()
  })
})
