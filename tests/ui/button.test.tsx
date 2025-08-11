import React from 'react'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui'

describe('Button', () => {
  it('renders label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('defaults type to button', () => {
    render(<Button>Click</Button>)
    const btn = screen.getByRole('button', { name: /click/i })
    expect(btn).toHaveAttribute('type', 'button')
  })
})
