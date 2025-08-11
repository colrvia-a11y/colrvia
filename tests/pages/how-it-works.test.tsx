import React from 'react'
import { describe, it, expect } from 'vitest'
import Page from '@/app/how-it-works/page'
import { render } from '@testing-library/react'

describe('/how-it-works page', () => {
  it('renders copy and a Start CTA', () => {
    // @ts-ignore
    const { getByText } = render(<Page />)
    expect(getByText('How it works')).toBeTruthy()
    expect(getByText('Pick a designer')).toBeTruthy()
    expect(getByText('Answer a few quick questions')).toBeTruthy()
    expect(getByText('Get real paint codes + placements')).toBeTruthy()
    expect(getByText('Start Color Story')).toBeTruthy()
  })
})
