import { describe, it, expect, afterEach } from 'vitest'
import { isVoiceEnabled } from '@/lib/flags'

describe('isVoiceEnabled', () => {
  const original = process.env.NEXT_PUBLIC_VOICE_ENABLED
  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_VOICE_ENABLED
    else process.env.NEXT_PUBLIC_VOICE_ENABLED = original
  })

  it('defaults to true when env not set', () => {
    delete process.env.NEXT_PUBLIC_VOICE_ENABLED
    expect(isVoiceEnabled()).toBe(true)
  })

  it('returns false when env is false', () => {
    process.env.NEXT_PUBLIC_VOICE_ENABLED = 'false'
    expect(isVoiceEnabled()).toBe(false)
  })

  it('returns false when env is 0', () => {
    process.env.NEXT_PUBLIC_VOICE_ENABLED = '0'
    expect(isVoiceEnabled()).toBe(false)
  })
})
