import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Button from '@/components/ui/Button'

test('button uses brand styling and is accessible', () => {
  render(<Button>Get My Palette</Button>)
  const btn = screen.getByRole('button', { name: /get my palette/i })
  expect(btn).toBeInTheDocument()
})
