import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import QuestionRenderer from '@/components/assistant/QuestionRenderer'

describe('QuestionRenderer completion', () => {
  it('shows reveal button and triggers callback', () => {
    const onComplete = vi.fn()
    const turn = {
      field_id: '_complete',
      next_question: 'Ready?',
      input_type: 'text'
    } as any
    render(
      <QuestionRenderer turn={turn} onAnswer={() => {}} onComplete={onComplete} />
    )
    const btn = screen.getByRole('button', { name: /reveal my palette/i })
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('renders reveal button as a non-submitting button', () => {
    const onComplete = vi.fn()
    const turn = {
      field_id: '_complete',
      next_question: 'Ready?',
      input_type: 'text'
    } as any
    render(
      <form>
        <QuestionRenderer turn={turn} onAnswer={() => {}} onComplete={onComplete} />
      </form>
    )
    const btn = screen.getByRole('button', { name: /reveal my palette/i })
    expect(btn).toHaveAttribute('type', 'button')
    fireEvent.click(btn)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})

