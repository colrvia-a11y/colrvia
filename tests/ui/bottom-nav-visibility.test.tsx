import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  usePathname: () => '/preferences/abc'
}))

vi.mock('@/components/ux/RouteTransition', () => ({ default: ({children}:{children:React.ReactNode}) => <>{children}</> }))

import ShellLayout from '@/app/(shell)/layout'

describe('ShellLayout BottomNav visibility', () => {
  it('shows BottomNav on preferences paths', () => {
    const { queryByLabelText } = render(<ShellLayout><div>content</div></ShellLayout>)
    expect(queryByLabelText('Primary')).toBeTruthy()
  })
})
