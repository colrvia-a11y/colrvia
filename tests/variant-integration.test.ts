import { describe, it, expect } from 'vitest'
import { limitVariant } from '@/lib/rate-limit'

// Pseudo-integration: exercising local rate limiter used in variant POST route.

describe('rate limiter (variant)', () => {
  it('allows initial bursts then blocks', () => {
    const results: boolean[] = []
    for(let i=0;i<7;i++) results.push(limitVariant('user-test').ok)
    expect(results.slice(0,6).every(Boolean)).toBe(true)
    expect(results[6]).toBe(false)
  })
})
