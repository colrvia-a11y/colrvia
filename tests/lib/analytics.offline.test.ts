import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('posthog-js', () => {
  return {
    default: {
      init: vi.fn(),
      capture: vi.fn(),
      identify: vi.fn(),
      register: vi.fn(),
    }
  }
})

describe('analytics offline queue', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    localStorage.clear()
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test'
  })

  it('queues events offline and flushes when back online', async () => {
    const onlineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const analytics = await import('@/lib/analytics')
    analytics.track('nav_click', { dest: '/foo' })
    expect(JSON.parse(localStorage.getItem('ph_queue') || '[]')).toHaveLength(1)

    await new Promise(r => setTimeout(r))
    const posthog = (await import('posthog-js')).default as any
    expect(posthog.capture).not.toHaveBeenCalled()

    onlineSpy.mockReturnValue(true)
    window.dispatchEvent(new Event('online'))

    expect(posthog.capture).toHaveBeenCalledWith('nav_click', { dest: '/foo' })
    expect(localStorage.getItem('ph_queue')).toBeNull()
    onlineSpy.mockRestore()
  })

  it('flushes queued events when service worker reports online', async () => {
    const onlineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const sw = new EventTarget()
    Object.defineProperty(navigator, 'serviceWorker', { value: sw, configurable: true })
    const analytics = await import('@/lib/analytics')
    analytics.track('nav_click', { dest: '/bar' })
    expect(JSON.parse(localStorage.getItem('ph_queue') || '[]')).toHaveLength(1)

    await new Promise(r => setTimeout(r))
    const posthog = (await import('posthog-js')).default as any
    expect(posthog.capture).not.toHaveBeenCalled()

    onlineSpy.mockReturnValue(true)
    sw.dispatchEvent(new MessageEvent('message', { data: 'online' }))

    expect(posthog.capture).toHaveBeenCalledWith('nav_click', { dest: '/bar' })
    expect(localStorage.getItem('ph_queue')).toBeNull()
    onlineSpy.mockRestore()
    delete (navigator as any).serviceWorker
  })
})
