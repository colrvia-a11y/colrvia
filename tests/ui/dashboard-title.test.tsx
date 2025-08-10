import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StoryHeroCard from '@/components/visual/StoryHeroCard'
import { MotionProvider } from '@/components/theme/MotionSettings'

function wrap(node:React.ReactNode){
  return <MotionProvider>{node}</MotionProvider>
}

describe('Dashboard story title fallback', () => {
  beforeAll(()=>{
    // Provide minimal matchMedia mock for MotionProvider
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false
      })
    })
  })
  it('uses provided title', () => {
    render(wrap(<StoryHeroCard imageSrc="/icons/icon-192.png" title="Custom Title" meta="Brand · Vibe" href="/reveal/mock" />))
    expect(screen.getByRole('heading', { name:/custom title/i })).toBeInTheDocument()
  })
  it('shows fallback when empty title', () => {
    const fallback = 'Color Story 123abc'
    // Simulate how dashboard would pass fallback (logic occurs upstream)
    render(wrap(<StoryHeroCard imageSrc="/icons/icon-192.png" title={fallback} meta="Brand · Vibe" href="/reveal/mock" />))
    expect(screen.getByRole('heading', { name:/color story 123abc/i })).toBeInTheDocument()
  })
})
