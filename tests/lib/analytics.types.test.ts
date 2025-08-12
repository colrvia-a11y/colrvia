import { track } from '@/lib/analytics'

describe('analytics event typing', () => {
  it('accepts defined events', () => {
    track('nav_click', { dest: '/home' })
  })

  // @ts-expect-error - invalid event name
  track('invalid_event', {})
  // @ts-expect-error - invalid payload
  track('nav_click', { wrong: true })
})
