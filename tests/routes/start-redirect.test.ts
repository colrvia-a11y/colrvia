import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => {
  return { redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT') }) }
})

describe('/start redirect', () => {
  it('redirects to /designers', async () => {
    const mod = await import('../../app/start/page')
    await expect(async () => {
      // @ts-ignore calling server component function
      mod.default()
    }).rejects.toThrow('NEXT_REDIRECT')
  })
})
