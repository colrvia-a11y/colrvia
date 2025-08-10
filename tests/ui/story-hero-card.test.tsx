import React from 'react'
import { render, screen } from '@testing-library/react'
import StoryHeroCard from '@/components/visual/StoryHeroCard'
import { MotionProvider } from '@/components/theme/MotionSettings'

function wrap(node:React.ReactNode){
  return <MotionProvider>{node}</MotionProvider>
}

describe('StoryHeroCard', () => {
  beforeAll(()=>{
    // jsdom does not implement matchMedia; provide minimal mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {}, // deprecated
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
      })
    })
  })
  it('renders title and cta', () => {
    render(wrap(<StoryHeroCard imageSrc="/icons/icon-192.png" title="Kitchen Refresh" meta="Designer · SW" href="/reveal/mock" />))
    expect(screen.getByRole('heading', { name:/kitchen refresh/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name:/open/i })).toBeInTheDocument()
  })
})
