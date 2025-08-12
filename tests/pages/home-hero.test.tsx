import React from 'react'
import { describe, it, expect } from 'vitest'
import Home from '@/app/page'
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '@/messages/en.json'
import { vi } from 'vitest'
vi.mock('@/components/ux/StartStoryPortal', () => ({ useStartStory: () => (()=>{}) }))

// Simple render (server component is now a plain function)

describe('Home hero', () => {
  it('shows hero copy and CTA', () => {
    // @ts-ignore
    const { getByText } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Home />
      </NextIntlClientProvider>
    )
    expect(getByText('instant color confidence')).toBeTruthy()
    expect(getByText('from vibe to walls in minutes.')).toBeTruthy()
    expect(getByText('real paint codes. clear placements.')).toBeTruthy()
    expect(getByText('Start Color Story')).toBeTruthy()
  })
})
