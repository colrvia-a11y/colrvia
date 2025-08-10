import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StoryActionBar from '@/components/reveal/StoryActionBar'

const palette = [
  { brand:'SW', name:'Alabaster', code:'SW7008', hex:'#EDEAE4', role:'walls' },
  { brand:'SW', name:'Evergreen Fog', code:'SW9130', hex:'#5A6F66', role:'accent' }
]

describe('StoryActionBar copy', ()=>{
  it('copies all palette codes', async ()=>{
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, writable:true })
    render(<StoryActionBar storyId="x1" palette={palette} />)
    fireEvent.click(screen.getByRole('button', { name:/copy palette codes/i }))
    await waitFor(()=> expect(writeText).toHaveBeenCalledTimes(1))
    const text = writeText.mock.calls[0][0]
    expect(text).toMatch(/Alabaster/) 
    expect(text.split('\n').length).toBe(2)
  })
})
