import React from 'react'
import { describe, it, expect, vi } from 'vitest'
// Ensure React is available globally for components compiled with classic JSX runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).React = React
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VoiceInterview from '@/components/voice/VoiceInterview'

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace })
}))
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))
vi.mock('@/lib/voice/session', () => ({
  listenOnce: vi.fn(),
  speak: vi.fn(),
  startVoiceSession: vi.fn(),
  stopSpeak: vi.fn(),
}))
import { listenOnce } from '@/lib/voice/session'

const responses = [
  'modern',
  'calm cozy',
  'open',
  'trim',
  'none',
  'kitchen',
  'bright',
  'white cabinets'
]
const total = responses.length
listenOnce.mockImplementation(() => Promise.resolve(responses.shift()!))

describe('VoiceInterview', () => {
  it('progresses through questions and completes', async () => {
    render(<VoiceInterview />)

    const questions = [
      'How would you describe your style?',
      'Give up to three mood words.',
      'How do you feel about dark colors?',
      'Where could we use dark colors?',
      'Any constraints or rules we should know about?',
      'Which room are we working on?',
      'How is the light in this room?',
      'Tell me about your kitchen details.'
    ]

    const mic = await screen.findByRole('button', { name: /tap to answer/i })

    for (let i = 0; i < total; i++) {
      expect(screen.getByText(questions[i])).toBeTruthy()
      fireEvent.click(mic)
      if (i < questions.length - 1) {
        await screen.findByText(questions[i + 1])
      }
    }

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/start/processing')
    })
    expect(listenOnce).toHaveBeenCalledTimes(total)
  })
})
