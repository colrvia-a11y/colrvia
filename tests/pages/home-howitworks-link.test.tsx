import React from 'react'
import { describe, it, expect } from 'vitest'
import Home from '@/app/page'
import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '@/messages/en.json'
import { vi } from 'vitest'
vi.mock('@/components/ux/StartStoryPortal', () => ({ useStartStory: () => (()=>{}) }))

describe("Home 'How it works' trigger", () => {
  it('shows how it works button', () => {
    // @ts-ignore
    const { getByText } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Home />
      </NextIntlClientProvider>
    )
    expect(getByText('How it works')).toBeTruthy()
  })
})

