import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PaletteGrid from '@/components/reveal/PaletteGrid'

const palette = Array.from({length:6}).map((_,i)=> ({ brand:'SW', name:`Color${i}`, code:`SW${i}00${i}`, hex:'#EEEED'+(i%10), role: i===0?'walls':'accent' }))

describe('PaletteGrid keyboard nav', ()=>{
  it('roves focus across swatch cards', ()=>{
  // mock matchMedia for motion provider
  Object.defineProperty(window, 'matchMedia', { writable:true, value: (q:string)=>({ matches:false, media:q, onchange:null, addEventListener:()=>{}, removeEventListener:()=>{}, addListener:()=>{}, removeListener:()=>{}, dispatchEvent:()=>false }) })
    render(<PaletteGrid palette={palette} />)
    const cards = screen.getAllByRole('group')
    expect(cards[0].tabIndex).toBe(0)
    cards[0].focus()
    fireEvent.keyDown(cards[0], { key:'ArrowRight' })
    expect(document.activeElement).toBe(cards[1])
    fireEvent.keyDown(cards[1], { key:'End' })
    expect(document.activeElement).toBe(cards[cards.length-1])
    fireEvent.keyDown(cards[cards.length-1], { key:'Home' })
    expect(document.activeElement).toBe(cards[0])
  })
})
