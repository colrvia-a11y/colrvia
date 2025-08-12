import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useIntakeChat } from '@/lib/hooks/useIntakeChat'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

// Ensure API mode
// @ts-ignore
process.env.NEXT_PUBLIC_ONBOARDING_MODE = 'api'

describe('useIntakeChat', () => {
  it('advances through questions and finalizes', async () => {
    const fetchMock = vi
      .fn()
      // start
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ sessionId: 'sess1', step: { type: 'question', node: { question: 'Brand?', options: ['SW'] } } })
        )
      )
      // step -> done
      .mockResolvedValueOnce(new Response(JSON.stringify({ step: { type: 'done' } })))
      // finalize
      .mockResolvedValueOnce(new Response(JSON.stringify({ input: { brand: 'SW' }, palette_v2: {} })))
      // create story
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'story1' })))
    // @ts-ignore
    global.fetch = fetchMock

    const { result } = renderHook(() => useIntakeChat('emily'))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(result.current.currentNode?.question).toBe('Brand?')

    await act(async () => {
      await result.current.submit('SW')
    })

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/intakes/finalize', expect.any(Object)))
    expect(result.current.done).toBe(true)
  })

  it('handles intermediate questions', async () => {
    const fetchMock = vi
      .fn()
      // start
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ sessionId: 'sess1', step: { type: 'question', node: { question: 'Brand?' } } })
        )
      )
      // step -> another question
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ step: { type: 'question', node: { question: 'Vibe?' } } })
        )
      )
      // step -> done
      .mockResolvedValueOnce(new Response(JSON.stringify({ step: { type: 'done' } })))
      // finalize
      .mockResolvedValueOnce(new Response(JSON.stringify({ input: {}, palette_v2: {} })))
      // create story
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'story1' })))
    // @ts-ignore
    global.fetch = fetchMock

    const { result } = renderHook(() => useIntakeChat('emily'))
    await waitFor(() => expect(result.current.currentNode?.question).toBe('Brand?'))

    await act(async () => {
      await result.current.submit('Sherwin')
    })
    await waitFor(() => expect(result.current.currentNode?.question).toBe('Vibe?'))

    await act(async () => {
      await result.current.submit('Cozy')
    })
    await waitFor(() => expect(result.current.done).toBe(true))
  })
})

