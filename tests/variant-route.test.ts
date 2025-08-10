import { describe, it, expect, vi } from 'vitest'
import { decodePalette } from '@/lib/palette'

describe('decodePalette basic', () => {
  it('returns [] for garbage', () => {
    expect(decodePalette('x').length).toBe(0)
  })
  it('flattens colors', () => {
    expect(decodePalette({ colors:[{ hex:'#fff' }] }).length).toBe(1)
  })
  it('flattens role object', () => {
    expect(decodePalette({ primary:{ hex:'#000000' }, secondary:{ hex:'#111111' } }).length).toBe(2)
  })
})
