import { describe, it, expect } from 'vitest'
import * as mod from '@/app/api/share/[id]/image/route'

describe('OG image route', () => {
  it('exports node runtime', () => {
    // @ts-ignore
    expect(mod.runtime).toBe('nodejs')
  })
})
