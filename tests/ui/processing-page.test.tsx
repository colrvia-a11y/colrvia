// tests/ui/processing-page.test.tsx
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams()
}))
import * as palette from '@/lib/palette'
import Page from '@/app/(shell)/start/processing/page'

describe('/start/processing', () => {
  it.skip('shows attempts and times out with error after retries', async () => {
    const timeout = vi.spyOn(global, 'setTimeout').mockImplementation((fn: any) => { fn(); return 0 as any })
    const spy = vi.spyOn(palette, 'createPaletteFromInterview').mockResolvedValue(null)
    render(<Page />)
    for (let i = 0; i < 6; i++) await Promise.resolve()
    expect(screen.getByText(/couldn’t finish/i)).toBeTruthy()
    expect(spy).toHaveBeenCalledTimes(5)
    timeout.mockRestore()
  })
})
