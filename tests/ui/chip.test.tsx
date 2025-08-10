import React from 'react'
import { render, screen } from '@testing-library/react'
import Chip from '@/components/ui/Chip'

describe('Chip', () => {
  it('renders and toggles pressed state attr', () => {
    render(<Chip active>Behr</Chip>)
    const chip = screen.getByRole('button', { name: /behr/i })
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })
})
