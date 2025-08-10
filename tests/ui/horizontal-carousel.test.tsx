import { render, screen, fireEvent } from '@testing-library/react'
import HorizontalCarousel from '@/components/visual/HorizontalCarousel'
import React from 'react'

function Cards(){
  return (
    <HorizontalCarousel ariaLabel="Demo carousel">
      {Array.from({length:8}).map((_,i)=> <div key={i} data-testid={`card-${i}`} className="snap-start shrink-0 w-[260px] h-10 bg-[var(--bg-surface)] border border-[var(--border)]" /> )}
    </HorizontalCarousel>
  )
}

describe('HorizontalCarousel a11y', ()=>{
  it('focuses container and responds to arrow keys', ()=>{
    render(<Cards />)
    const region = screen.getByRole('region', { name:/demo carousel/i })
    const scroller = region.querySelector('[tabindex="0"]') as HTMLElement
    expect(scroller).toBeTruthy()
    scroller.focus()
    expect(document.activeElement).toBe(scroller)
    // Simulate right arrow
    fireEvent.keyDown(scroller, { key:'ArrowRight' })
    // Can't easily assert scroll position without layout; ensure no crash
    fireEvent.keyDown(scroller, { key:'End' })
    fireEvent.keyDown(scroller, { key:'Home' })
  })
})
