import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import BottomTabBar from '@/components/nav/BottomTabBar'

describe('BottomTabBar stub', () => {
  it('renders nothing', () => {
    const { container } = render(<BottomTabBar />)
    expect(container.firstChild).toBeNull()
  })
})
