import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/realtalk/api', () => ({ postTurn: vi.fn() }))
vi.mock('@/hooks/useSpeech', () => ({ useSpeech: () => ({ supported:true, listening:false, interim:'', start:vi.fn(), stop:vi.fn() }) }))
import { postTurn } from '@/lib/realtalk/api'

import RealTalkQuestionnaire from '@/components/realtalk/RealTalkQuestionnaire'

describe('Inline explain', () => {
  it('loads explanation on click', async () => {
    ;(postTurn as any).mockResolvedValueOnce({
      prompt:{ id:'t1', text:'Why?', input_type:'text' },
      answers:{}
    })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({ explanation:'Because we care' })
    } as any)
    const { getByText, findByText } = render(<RealTalkQuestionnaire autoStart />)
    await waitFor(() => getByText('Why this question?'))
    fireEvent.click(getByText('Why this question?'))
    const exp = await findByText('Because we care')
    expect(exp).toBeInTheDocument()
    fetchMock.mockRestore()
  })
})
