import { describe, test, expect, beforeEach, afterAll } from 'vitest'
import { isPreviewEnv, isAuthDisabled, allowGuestWrites } from '@/lib/flags'

describe('flags env behavior', () => {
  const OLD = process.env
  beforeEach(() => { process.env = { ...OLD } })
  afterAll(() => { process.env = OLD })

  test('preview enables guest mode + writes', () => {
    process.env.VERCEL_ENV = 'preview'
    expect(isAuthDisabled()).toBe(true)
    expect(allowGuestWrites()).toBe(true)
  })

  test('production keeps auth by default', () => {
    process.env.VERCEL_ENV = 'production'
    delete process.env.ALLOW_GUEST_WRITES
    delete process.env.NEXT_PUBLIC_AUTH_DISABLED
    expect(isAuthDisabled()).toBe(false)
    expect(allowGuestWrites()).toBe(false)
  })
})
