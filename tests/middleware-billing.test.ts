import { describe, it, expect, vi } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_FEATURE_BILLING', 'false')
import { middleware } from '@/middleware'

const makeReq = (url: string) => {
  const u = new URL(url)
  return { nextUrl: Object.assign(u, { clone: () => new URL(u.toString()) }) } as any
}

describe('middleware billing flag', () => {
  it('redirects billing when flag off', () => {
    const res: any = middleware(makeReq('http://localhost:3000/billing'))
    expect(res?.status).toBe(307)
    expect(res?.headers?.get?.('location')).toMatch(/\/start\?/)
  })
})
