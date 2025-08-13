import React from 'react'
import { describe, it, expect, vi } from 'vitest'
// Ensure React is global for classic JSX
;(globalThis as any).React = React
import { render, screen, waitFor } from '@testing-library/react'
import VoiceInterview from '@/components/voice/VoiceInterview'

const replace = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))

describe('VoiceInterview realtime', () => {
  it('shows question from model', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ client_secret: { value: 'tok' } }) })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('sdp-answer') })
    ;(globalThis as any).fetch = fetchMock

    ;(navigator as any).mediaDevices = {
      getUserMedia: vi.fn(() => Promise.resolve({ getTracks: () => [{ stop: vi.fn() }] })),
    }

    let dc: any
    const pc = {
      addTransceiver: vi.fn(),
      addTrack: vi.fn(),
      createDataChannel: vi.fn(() => {
        dc = {
          onopen: null as any,
          onmessage: null as any,
          send: vi.fn(),
          readyState: 'open',
        }
        return dc
      }),
      createOffer: vi.fn(() => Promise.resolve({ sdp: 'local', type: 'offer' })),
      setLocalDescription: vi.fn(),
      localDescription: { sdp: 'local' },
      iceGatheringState: 'complete',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setRemoteDescription: vi.fn(),
      getSenders: () => [],
      close: vi.fn(),
      ontrack: null as any,
    }
    ;(globalThis as any).RTCPeerConnection = vi.fn(() => pc)

    render(<VoiceInterview />)

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    dc.onopen?.()
    const delta = JSON.stringify({
      field_id: 'style_primary',
      next_question: 'How would you describe your style?',
      input_type: 'text',
    })
    dc.onmessage?.({ data: JSON.stringify({ type: 'response.output_text.delta', delta }) })
    dc.onmessage?.({ data: JSON.stringify({ type: 'response.completed' }) })

    await screen.findByText('How would you describe your style?')
  })
})
