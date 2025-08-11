import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import AppShell from '@/components/AppShell'

describe('Header/AppShell', () => {
  it('does not show legacy Start/My Stories links', () => {
    // @ts-ignore
    const { queryByText } = render(<AppShell><div /></AppShell>)
    expect(queryByText('Start')).toBeNull()
    expect(queryByText('My Stories')).toBeNull()
  })
})
