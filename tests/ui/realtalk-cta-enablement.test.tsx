import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/realtalk/api', () => ({ postTurn: vi.fn() }))
vi.mock('@/components/realtalk/InlineHelp', () => ({ default: () => null }))
vi.mock('@/hooks/useSpeech', () => ({ useSpeech: () => ({ supported:true, listening:false, interim:'', start:vi.fn(), stop:vi.fn() }) }))

import { postTurn } from '@/lib/realtalk/api'
import RealTalkQuestionnaire from '@/components/realtalk/RealTalkQuestionnaire'

describe('CTA enablement', () => {
  it('enables continue for text when filled', async () => {
    ;(postTurn as any).mockResolvedValueOnce({
      prompt:{ id:'t1', text:'Say', input_type:'text', validation:{required:true}},
      answers:{},
    })
    const { getByRole } = render(<RealTalkQuestionnaire autoStart />)
    const btn = await waitFor(() => getByRole('button', { name:'Continue →' }))
    expect(btn).toBeDisabled()
    const input = getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target:{ value:'hi' }})
    expect(btn).not.toBeDisabled()
  })

  it('continue is enabled for single select', async () => {
    ;(postTurn as any).mockReset()
    ;(postTurn as any).mockResolvedValueOnce({
      prompt:{ id:'s1', text:'Pick', input_type:'singleSelect', choices:[{id:'a',label:'A'}] },
      answers:{},
    })
    const { getByRole } = render(<RealTalkQuestionnaire autoStart />)
    const btn = await waitFor(() => getByRole('button', { name:'Continue →' }))
    expect(btn).not.toBeDisabled()
  })

  it('enables continue for multi select after choice', async () => {
    ;(postTurn as any).mockReset()
    ;(postTurn as any).mockResolvedValueOnce({
      prompt:{ id:'m1', text:'Pick many', input_type:'multiSelect', choices:[{id:'a',label:'A'}], validation:{required:true} },
      answers:{},
    })
    const { getByRole, getByText } = render(<RealTalkQuestionnaire autoStart />)
    const btn = await waitFor(() => getByRole('button', { name:'Continue →' }))
    expect(btn).toBeDisabled()
    fireEvent.click(getByText('A'))
    expect(btn).not.toBeDisabled()
  })
})
