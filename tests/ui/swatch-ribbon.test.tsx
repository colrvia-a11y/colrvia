import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SwatchRibbon from '@/components/visual/SwatchRibbon'
import { MotionProvider } from '@/components/theme/MotionSettings'

// Basic mock for clipboard API
afterEach(()=>{
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable:true })
})

describe('SwatchRibbon', () => {
  it('copies a swatch hex', async () => {
  Object.defineProperty(window, 'matchMedia', { writable:true, value:(q:string)=>({ matches:false, media:q, onchange:null, addListener:()=>{}, removeListener:()=>{}, addEventListener:()=>{}, removeEventListener:()=>{}, dispatchEvent:()=>false }) })
    const user = userEvent.setup()
    const mockWrite = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { value:{ writeText: mockWrite }, configurable:true })
  render(<MotionProvider><SwatchRibbon swatches={[{ hex:'#123456', name:'Primary'},{ hex:'#abcdef'}]} /></MotionProvider>)
    const btn = screen.getByRole('button', { name:/copy primary/i })
    await user.click(btn)
    expect(mockWrite).toHaveBeenCalledWith('#123456')
  })
})
