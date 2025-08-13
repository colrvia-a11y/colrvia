import { describe, it, expect } from 'vitest'
import { RoomProfileSchema } from '@/lib/vision/roomProfile'

describe('RoomProfileSchema', () => {
  it('accepts minimal valid object and fills defaults', () => {
    const parsed = RoomProfileSchema.parse({
      room: { type: 'living_room' },
      fixed: {},
      changeable: { walls_paint: true }
    })
    expect(parsed.changeable.walls_paint).toBe(true)
    expect(parsed.exclusions.avoid_matching_current_walls).toBe(true)
  })

  it('rejects values out of bounds', () => {
    expect(() => RoomProfileSchema.parse({
      room: { type: 'kitchen' },
      fixed: { floor: { tone: 'too_spicy' } }
    } as any)).toThrow()
  })
})
