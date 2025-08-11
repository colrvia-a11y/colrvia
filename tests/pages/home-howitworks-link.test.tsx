import React from 'react'
import { describe, it, expect } from 'vitest'
import Home from '@/app/page'
import { render } from '@testing-library/react'

describe("Home 'See how it works' link", () => {
  it('shows simplified link text', () => {
    // @ts-ignore
    const { getByText, queryByText } = render(<Home />)
    expect(getByText('See how it works')).toBeTruthy()
    expect(queryByText('(full page)')).toBeNull()
    expect(queryByText('1 min')).toBeNull()
  })
})

