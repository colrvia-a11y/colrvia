import React from 'react'
import { describe, it, expect } from 'vitest'
import Home from '@/app/page'
import { render } from '@testing-library/react'

describe("Home 'See how it works' link", () => {
  it('shows the link under the CTA', () => {
    // @ts-ignore
    const { getByText } = render(<Home />)
    expect(getByText('See how it works (1 min)')).toBeTruthy()
  })
})
