import React from 'react'
import { render, screen } from '@testing-library/react'
import VoiceMic from '@/components/assistant/VoiceMic'

describe('VoiceMic button', () => {
  it('renders a visible Talk to designer button when idle', () => {
    render(<VoiceMic />)
    const btn = screen.getByRole('button', { name: /talk to designer/i })
    expect(btn).toBeInTheDocument()
  })
})
