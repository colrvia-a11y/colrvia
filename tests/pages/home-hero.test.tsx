import React from 'react'
import { describe, it, expect } from 'vitest'
import Home from '@/app/page'
import { render } from '@testing-library/react'

// Simple render (server component is now a plain function)

describe('Home hero', () => {
  it('shows the new copy and CTA', () => {
    // @ts-ignore
    const { getByText } = render(<Home />)
    expect(getByText('instant color confidence')).toBeTruthy()
    expect(getByText('from vibe to walls in minutes.')).toBeTruthy()
  expect(getByText('real paint codes. clear placements.')).toBeTruthy()
    expect(getByText('Start Color Story')).toBeTruthy()
  })
})
