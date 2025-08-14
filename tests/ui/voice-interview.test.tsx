import React from 'react'
import { describe, it, expect, vi } from 'vitest'
// Ensure React is global for classic JSX
;(globalThis as any).React = React
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import VoiceInterview from '@/components/voice/VoiceInterview'

const replace = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))

describe('VoiceInterview realtime', () => {
  it('sends a system prompt to prime the realtime model', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ client_secret: { value: 'tok' } }) })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('remote-sdp') })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            turn: {
              field_id: 'room_type',
              next_question:
                "Hello! I’m Moss, your Color Therapist. Let’s get started. Which space are we designing? (e.g. Living Room, Kitchen, Bedroom…)",
              input_type: 'singleSelect',
              choices: null,
              validation: null,
            },
          }),
      })
    ;(globalThis as any).fetch = fetchMock

    ;(navigator as any).mediaDevices = {
      getUserMedia: vi.fn(() => Promise.resolve({ getTracks: () => [{ stop: vi.fn() }] })),
    }

    ;(HTMLMediaElement.prototype as any).play = vi.fn(() => Promise.resolve())

    let sent: any[] = []
    let dc: any
    const pc = {
      addTransceiver: vi.fn(),
      addTrack: vi.fn(),
      createDataChannel: vi.fn(() => {
        dc = {
          onopen: null as any,
          onmessage: null as any,
          send: vi.fn((payload: string) => sent.push(JSON.parse(payload))),
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
    fireEvent.click(screen.getByRole('button', { name: /enable voice/i }))
    await waitFor(() => expect(dc.onopen).toBeTruthy())
    dc.onopen?.()

    // first send should be a conversation.item.create with a system role
    const first = sent.find((m) => m?.type === 'conversation.item.create')
    expect(first?.item?.role).toBe('system')
    expect(JSON.stringify(first)).toMatch(/Moss, an AI color consultant/)

    // and we should ask the first question as audio/text
    await waitFor(() => expect(sent.find((m) => m?.type === 'response.create')).toBeTruthy())
    const ask = sent.find((m) => m?.type === 'response.create')
    expect(ask?.response?.instructions).toMatch(/Which space are we designing\?/i)
  })
  it('asks follow-up based on previous answer', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ client_secret: { value: 'tok' } }) })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('sdp-answer') })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            turn: {
              field_id: 'dark_stance',
              next_question: 'How do you feel about dark paint?',
              input_type: 'text',
            },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            turn: {
              field_id: 'dark_locations',
              next_question: 'Where would you use dark paint?',
              input_type: 'text',
            },
          }),
      })
    ;(globalThis as any).fetch = fetchMock

    ;(navigator as any).mediaDevices = {
      getUserMedia: vi.fn(() => Promise.resolve({ getTracks: () => [{ stop: vi.fn() }] })),
    }

    ;(HTMLMediaElement.prototype as any).play = vi.fn(() => Promise.resolve())

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

    fireEvent.click(screen.getByRole('button', { name: /enable voice/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    await waitFor(() => expect(pc.createDataChannel).toHaveBeenCalled())

    dc.onopen?.()

    await screen.findByText('How do you feel about dark paint?')

    dc.onmessage?.({
      data: JSON.stringify({ type: 'conversation.item.input_audio.transcription.delta', delta: 'Walls' }),
    })
    dc.onmessage?.({ data: JSON.stringify({ type: 'conversation.item.completed', item: { role: 'user' } }) })

    await screen.findByText('Where would you use dark paint?')

    const body = JSON.parse(fetchMock.mock.calls[3][1].body)
    expect(body.answers.dark_stance).toBe('Walls')
  })
})
