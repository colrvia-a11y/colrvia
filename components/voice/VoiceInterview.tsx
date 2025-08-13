'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatCaptions from '@/components/ai/ChatCaptions'
import { IntakeTurnZ } from '@/lib/model-schema'
import type { Answers } from '@/lib/intake/types'
import { track } from '@/lib/analytics'

export default function VoiceInterview() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [activeSection, setActiveSection] = useState<'style' | 'room'>('style')
  const [captions, setCaptions] = useState('')
  const answersRef = useRef<Answers>({})
  const currentIdRef = useRef<string | null>(null)
  const modelTextRef = useRef('')
  const userTextRef = useRef('')
  const pcRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const tokenRes = await fetch('/api/realtime/session', { method: 'POST' })
        if (!tokenRes.ok) throw new Error('session init failed')
        const tokenData = await tokenRes.json()
        const clientSecret = tokenData?.client_secret?.value
        if (!clientSecret) throw new Error('missing token')

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (cancelled) return

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
          iceTransportPolicy: 'all',
        })
        pcRef.current = pc

        const audioEl = new Audio()
        audioEl.autoplay = true
        pc.ontrack = (e) => { audioEl.srcObject = e.streams[0] }
        pc.addTransceiver('audio', { direction: 'sendrecv' })
        pc.addTrack(stream.getTracks()[0], stream)

        const dc = pc.createDataChannel('oai-events')
        dc.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data)
            if (msg.type === 'response.output_text.delta') {
              modelTextRef.current += msg.delta
            } else if (msg.type === 'response.completed') {
              const raw = modelTextRef.current.trim()
              modelTextRef.current = ''
              if (!raw) return
              try {
                const turn = IntakeTurnZ.parse(JSON.parse(raw))
                currentIdRef.current = turn.field_id
                setCurrentQuestion(turn.next_question)
                setActiveSection(turn.field_id.includes('room') ? 'room' : 'style')
                track('question_shown', { id: turn.field_id, priority: 'P1' })
              } catch (err) {
                console.error('parse', err)
              }
            } else if (msg.type === 'conversation.item.input_audio.transcription.delta') {
              userTextRef.current += msg.delta
              setCaptions((c) => c + msg.delta)
            } else if (msg.type === 'conversation.item.completed') {
              if (msg.item?.role === 'user' && currentIdRef.current) {
                const t = userTextRef.current.trim()
                userTextRef.current = ''
                setCaptions('')
                answersRef.current = {
                  ...answersRef.current,
                  [currentIdRef.current]: t,
                }
                track('answer_saved', { id: currentIdRef.current, priority: 'P1' })
              } else if (msg.item?.role === 'assistant' && currentQuestion === '') {
                // no question means conversation complete
                router.replace('/start/processing')
              }
            }
          } catch {}
        }
        dc.onopen = () => {
          dc.send(
            JSON.stringify({
              type: 'response.create',
              response: {
                modalities: ['audio', 'text'],
                instructions: 'BEGIN',
              },
            }),
          )
        }

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        await new Promise<void>((resolve) => {
          if (pc.iceGatheringState === 'complete') return resolve()
          const check = () => {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', check)
              resolve()
            }
          }
          pc.addEventListener('icegatheringstatechange', check)
          setTimeout(resolve, 1200)
        })

        const res = await fetch('/api/realtime/offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sdp: pc.localDescription?.sdp || '', token: clientSecret }),
        })
        if (!res.ok) throw new Error('offer failed')
        const answerSDP = await res.text()
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSDP })
      } catch (e) {
        console.error(e)
      }
    }
    start()
    return () => {
      cancelled = true
      try {
        pcRef.current?.getSenders().forEach((s) => (s.track as MediaStreamTrack | undefined)?.stop())
        pcRef.current?.close()
      } catch {}
      pcRef.current = null
    }
  }, [router])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 p-4">
      <header className="w-full text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-full bg-brand" />
          <h2 className="text-lg font-medium">Moss</h2>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              activeSection === 'style'
                ? 'bg-brand text-brand-contrast'
                : 'border border-ink-subtle text-ink-subtle'
            }`}
          >
            Style
          </span>
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              activeSection === 'room'
                ? 'bg-brand text-brand-contrast'
                : 'border border-ink-subtle text-ink-subtle'
            }`}
          >
            Room
          </span>
        </div>
      </header>

      <main className="flex flex-col items-center gap-4">
        <p className="mt-2 text-center text-base">{currentQuestion}</p>
      </main>

      <ChatCaptions text={captions} />
    </div>
  )
}

