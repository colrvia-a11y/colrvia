import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SwatchRibbon from '@/components/visual/SwatchRibbon'

// Basic mock for clipboard API
afterEach(()=>{
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable:true })
})

describe('SwatchRibbon', () => {
  it('copies a swatch hex', async () => {
    const user = userEvent.setup()
    const mockWrite = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { value:{ writeText: mockWrite }, configurable:true })
    render(<SwatchRibbon swatches={[{ hex:'#123456', name:'Primary'},{ hex:'#abcdef'}]} />)
    const btn = screen.getByRole('button', { name:/copy primary/i })
    await user.click(btn)
    expect(mockWrite).toHaveBeenCalledWith('#123456')
  })
})
