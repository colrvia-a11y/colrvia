import { describe, it, expect } from 'vitest'

describe('analytics shim', () => {
  it('track() no-ops server side', async () => {
    const mod = await import('@/lib/analytics')
    expect(() => mod.track('test_event',{ foo: 'bar' })).not.toThrow()
  })
})
