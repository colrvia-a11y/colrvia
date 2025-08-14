import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/start/text-interview' }))
vi.mock('@/components/ux/RouteTransition', () => ({ default: ({children}:{children:React.ReactNode}) => <>{children}</> }))
vi.mock('@/components/nav/BottomNav', () => ({ default: () => <nav>Primary</nav> }))

import ShellLayout from '@/app/(shell)/layout'

describe('Bottom nav hidden on start routes', () => {
  it('does not render nav for /start routes', () => {
    const { queryByText } = render(<ShellLayout><div>Page</div></ShellLayout>)
    expect(queryByText('Primary')).toBeNull()
  })
})
