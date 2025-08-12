import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Cinematic from '@/components/reveal/Cinematic'
import { MotionProvider } from '@/components/theme/MotionSettings'

const story = { id:'s1', title:'Sample Story', palette:[{hex:'#123456', role:'walls'}], narrative:'Line one. Line two.', placements:{} }

describe('Cinematic reveal', ()=>{
  it('renders and exits on Esc', async ()=>{
  // mock matchMedia for motion provider
  Object.defineProperty(window, 'matchMedia', { writable:true, value: (q:string)=>({ matches:false, media:q, onchange:null, addEventListener:()=>{}, removeEventListener:()=>{}, addListener:()=>{}, removeListener:()=>{}, dispatchEvent:()=>false }) })
    const onExit = vi.fn()
  render(<MotionProvider><Cinematic open onExit={onExit} story={story} /></MotionProvider>)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(document, { key:'Escape' })
    await waitFor(() => expect(onExit).toHaveBeenCalled())
  })
})
