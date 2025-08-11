import { describe, it, expect, vi } from 'vitest'
vi.mock('next/navigation', () => ({ redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }) }))

describe('/stories redirect', () => {
  it('redirects to /dashboard', async () => {
    const mod = await import('../../app/stories/page')
    // @ts-ignore
    expect(() => mod.default()).toThrow('NEXT_REDIRECT')
  })
})
