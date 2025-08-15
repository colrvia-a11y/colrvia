import { shouldShowGreeting } from '@/app/via/greeting'

describe('Via greeting visibility', () => {
  it('shows greeting before any messages', () => {
    expect(shouldShowGreeting(0)).toBe(true)
  })
  it('hides greeting after first message', () => {
    expect(shouldShowGreeting(1)).toBe(false)
  })
})
