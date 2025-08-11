// tests/middleware-auth-dashboard.test.ts
import { describe, it, expect } from 'vitest'
import { middleware } from '@/middleware'

function makeReq(url: string, cookie?: string) {
  const u = new URL(url)
  const wrapped: any = {
    nextUrl: Object.assign(u, { clone: () => new URL(u.toString()) }),
    cookies: { has: (name: string) => (cookie || '').includes(name) },
  }
  return wrapped
}

describe('middleware dashboard auth', () => {
  it('redirects /dashboard when no auth cookies', () => {
    const res: any = middleware(makeReq('http://localhost:3000/dashboard'))
    expect(res?.status).toBe(307)
    expect(res?.headers?.get?.('location')).toMatch(/\/sign-in\?next=%2Fdashboard/)
  })

  it('allows /dashboard when access cookie present', () => {
    const res: any = middleware(
      makeReq('http://localhost:3000/dashboard', 'sb-access-token=abc.def.ghi')
    )
  // A NextResponse.next() returns undefined in our direct invocation; ensure no redirect
  expect(res?.headers?.get?.('location') ?? undefined).toBeUndefined()
  })
})
