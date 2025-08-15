import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/realtalk/api', () => ({ postTurn: vi.fn().mockResolvedValue({ prompt: null, answers: { vibe: 'Cozy' }, progress: { asked: 5 } }) }))
vi.mock('@/components/realtalk/InlineHelp', () => ({ __esModule: true, default: () => null }))
vi.mock('@/components/realtalk/Stepper', () => ({ __esModule: true, default: () => null }))
vi.mock('@/components/realtalk/StickyActions', () => ({ __esModule: true, default: () => null }))
vi.mock('@/lib/palette', () => ({ createPaletteFromInterview: vi.fn().mockResolvedValue({ id: 'mock' }) }))

const router = (globalThis as any).testRouter as { replace: any; push: any }
beforeEach(() => {
  router.replace.mockReset()
  router.push.mockReset()
})

import RealTalk from '@/components/realtalk/RealTalkQuestionnaire'

describe('RealTalk generation', () => {
  it('routes to reveal without redirecting when generation succeeds', async () => {
    render(<RealTalk autoStart={false} initialAnswers={{ vibe: 'Cozy' }} />)
    const btn = await screen.findByRole('button', { name: /Create my color story/i })
    fireEvent.click(btn)
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/reveal/mock?optimistic=1'))
    expect(router.push).not.toHaveBeenCalled()
  })
})
