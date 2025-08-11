import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('server analytics', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('no-ops without POSTHOG_KEY', async () => {
    const mod = await import('@/lib/analytics/server')
    const spy = vi.spyOn(globalThis, 'fetch' as any)
    await mod.capture('test_event', { a: 1 })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('fires fetch when POSTHOG_KEY is set', async () => {
    vi.stubEnv('POSTHOG_KEY', 'test-key')
    const fetchSpy = vi.spyOn(globalThis, 'fetch' as any).mockResolvedValue(new Response('{}') as any)
    const mod = await import('@/lib/analytics/server')
    await mod.capture('test_event', { a: 1 }, 'test')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(String(url)).toContain('/capture')
    const body = JSON.parse((init as any).body)
    expect(body.api_key).toBe('test-key')
    expect(body.event).toBe('test_event')
    fetchSpy.mockRestore()
  })
})
