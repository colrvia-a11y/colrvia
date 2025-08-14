import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/realtalk/api', () => ({ postTurn: vi.fn() }))
vi.mock('@/components/realtalk/InlineHelp', () => ({ default: () => null }))
vi.mock('@/hooks/useSpeech', () => ({ useSpeech: () => ({ supported:true, listening:false, interim:'', start:vi.fn(), stop:vi.fn() }) }))

import { postTurn } from '@/lib/realtalk/api'
import RealTalkQuestionnaire from '@/components/realtalk/RealTalkQuestionnaire'

describe('RealTalk progress', () => {
  it('uses server provided progress when available', async () => {
    ;(postTurn as any).mockResolvedValueOnce({
      prompt: { id:'q1', text:'Q1', input_type:'text' },
      answers:{},
      progress:{ asked:3, maxCap:12 }
    })
    const { getByRole } = render(<RealTalkQuestionnaire autoStart />)
    await waitFor(() => getByRole('progressbar'))
    const bar = getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('25')
  })

  it('falls back to history when progress missing', async () => {
    ;(postTurn as any).mockReset()
    ;(postTurn as any).mockResolvedValueOnce({
      prompt:{ id:'q1', text:'First', input_type:'text', validation:{required:true}},
      answers:{}
    })
    ;(postTurn as any).mockResolvedValueOnce({
      prompt:{ id:'q2', text:'Second', input_type:'text', validation:{required:true}},
      answers:{}
    })
    const { getByRole } = render(<RealTalkQuestionnaire autoStart />)
    await waitFor(() => getByRole('textbox'))
    const input = getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target:{ value:'hi' }})
    fireEvent.keyDown(input, { key:'Enter', code:'Enter' })
    await waitFor(() => getByRole('progressbar'))
    const bar = getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('20')
  })
})
