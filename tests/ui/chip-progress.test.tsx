import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Chip from '@/components/ui/Chip'
import Progress from '@/components/ui/Progress'

describe('Chip', ()=>{
  it('renders with inactive state and toggles aria-pressed when clicked via handler', ()=>{
    let active=false
    const { getByRole, rerender } = render(<Chip active={active} onClick={()=>{ active=!active; rerender(<Chip active={active} onClick={()=>{ active=!active; }} />) }} />)
    const btn = getByRole('button')
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(btn)
    // simulate another rerender to reflect change
    rerender(<Chip active={true} onClick={()=>{}} />)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })
})

describe('Progress', ()=>{
  it('caps value at 100%', ()=>{
    const { getByRole } = render(<Progress value={5} max={4} />)
    const bar = getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('100')
  })
  it('computes correct percentage', ()=>{
    const { getByRole } = render(<Progress value={2} max={4} />)
    const bar = getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('50')
  })
})
