// tests/ui/realtalk-persists-answers.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }))
vi.mock('@/lib/realtalk/api', () => ({ postTurn: vi.fn().mockResolvedValue({ prompt: null, answers: { vibe:'Cozy' }, progress: { asked: 5 } }) }))
vi.mock('@/components/realtalk/InlineHelp', () => ({ __esModule: true, default: () => null }))
vi.mock('@/components/realtalk/Stepper', () => ({ __esModule: true, default: () => null }))
vi.mock('@/components/realtalk/StickyActions', () => ({ __esModule: true, default: () => null }))
vi.mock('@/lib/palette', () => ({ createPaletteFromInterview: vi.fn().mockResolvedValue({ id: 'mock' }) }))
import RealTalk from '@/components/realtalk/RealTalkQuestionnaire'

describe('RealTalk persists answers', () => {
  it('writes colrvia:interview to localStorage on generate', async () => {
    const setItem = vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {})
    render(<RealTalk autoStart={false} initialAnswers={{ vibe: 'Cozy' }} />)
    const btn = await screen.findByRole('button', { name: /Create my color story/i })
    fireEvent.click(btn)
    expect(setItem).toHaveBeenCalledWith('colrvia:interview', expect.any(String))
  })
})
