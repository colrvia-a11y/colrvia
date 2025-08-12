import { describe, it, expect } from 'vitest'
import React from 'react'
import Home from '@/app/page'
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '@/messages/en.json'
import { vi } from 'vitest'
vi.mock('@/components/ux/StartStoryPortal', () => ({ useStartStory: () => (()=>{}) }))

// Basic sanity test to ensure client Home component renders and exposes CTA

describe('Home page (client)', () => {
  it('renders without crashing and shows CTA', () => {
    // @ts-ignore server wrapper differences
    const { getByText } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Home />
      </NextIntlClientProvider>
    )
    expect(getByText('Start Color Story')).toBeTruthy()
  })
})
