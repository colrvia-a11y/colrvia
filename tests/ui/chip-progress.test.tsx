import { describe, it, expect } from 'vitest'
import React, { useState } from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chip, Progress } from '@/components/ui'

describe('Chip', ()=>{
  it('toggles aria-pressed when clicked', async ()=>{
    function Wrapper(){
      const [active,setActive]=useState(false)
      return <Chip active={active} onClick={()=>setActive(a=>!a)}>Chip</Chip>
    }
    const { getByRole } = render(<Wrapper />)
    const btn = getByRole('button')
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    await userEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    await userEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('false')
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
