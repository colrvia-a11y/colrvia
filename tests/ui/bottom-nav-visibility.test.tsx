import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  usePathname: () => '/onboarding/abc',
}))

vi.mock('@/components/ux/RouteTransition', () => ({ default: ({children}:{children:React.ReactNode}) => <>{children}</> }))

vi.mock('next/dynamic', () => ({ default: (fn:any)=> fn() }))

import ShellLayout from '@/app/(shell)/layout'

describe('ShellLayout BottomNav visibility', () => {
  it('hides BottomNav on onboarding paths', () => {
    const { queryByLabelText } = render(<ShellLayout><div>content</div></ShellLayout>)
    expect(queryByLabelText('Primary')).toBeNull()
  })
})
