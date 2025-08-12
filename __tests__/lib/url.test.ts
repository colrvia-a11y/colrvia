import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { getAuthCallbackUrl } from '@/lib/url'

describe('getAuthCallbackUrl', () => {
  const OLD = process.env
  beforeEach(() => { process.env = { ...OLD } as any })
  afterAll(() => { process.env = OLD })

  it('uses NEXT_PUBLIC_SITE_URL when set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://preview.colrvia.com'
    expect(getAuthCallbackUrl()).toBe('https://preview.colrvia.com/auth/callback')
  })

  it('falls back to VERCEL_URL', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    process.env.VERCEL_URL = 'some-preview.vercel.app'
    expect(getAuthCallbackUrl()).toBe('https://some-preview.vercel.app/auth/callback')
  })

  it('defaults to localhost', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.VERCEL_URL
    expect(getAuthCallbackUrl()).toBe('http://localhost:3000/auth/callback')
  })
})
