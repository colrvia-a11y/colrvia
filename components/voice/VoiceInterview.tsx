'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatCaptions from '@/components/ai/ChatCaptions'
import { IntakeTurnZ } from '@/lib/model-schema'
import type { Answers } from '@/lib/intake/types'
import { track } from '@/lib/analytics'
import { getSection } from '@/lib/intake/sections'
import { isVoiceEnabled } from '@/lib/flags'

type BootStatus = 'booting' | 'ready' | 'error' | 'fallback'

export default function VoiceInterview() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [activeSection, setActiveSection] = useState<'style' | 'room'>('style')
  const [captions, setCaptions] = useState('')
  const answersRef = useRef<Answers>({})
  const currentIdRef = useRef<string | null>(null)
  const modelTextRef = useRef<string>('')
  const userTextRef = useRef('')
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const [status, setStatus] = useState<BootStatus>('booting')
  const bootTimerRef = useRef<number | null>(null)

  // Choose a slightly longer fallback on mobile/slow networks so iOS has time to show the mic sheet
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : ''
  const isMobile = /iphone|ipad|android/.test(ua)
  const net = (navigator as any)?.connection?.effectiveType || ''
  const slowNet = /2g|3g/.test(net)
  const fallbackDelay = isMobile || slowNet ? 6000 : 3000
  const showDiag =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('diag') === '1'

  function kickOffDeterministicFirstQuestion() {
    const first = "Let’s start with style. Which overall vibe do you love most?"
    setCurrentQuestion(first)
  }

  useEffect(() => {
    let pc: RTCPeerConnection | null = null
    let dc: RTCDataChannel | null = null
    let stream: MediaStream | null = null
    let cancelled = false
    async function start() {
      setStatus('booting')
      // fallback to deterministic text if realtime is slow/dead
      bootTimerRef.current = window.setTimeout(() => {
        try {
          kickOffDeterministicFirstQuestion()
          setStatus('fallback')
        } catch {
          setStatus('error')
        }
      }, fallbackDelay)

      const tokenRes = await fetch('/api/realtime/session', { method: 'POST' })
      if (!tokenRes.ok) {
        console.error('session init failed', await tokenRes.text().catch(() => ''))
        setStatus('fallback')
        return
      }
      const tokenData = await tokenRes.json().catch(() => ({} as any))
      const clientSecret = tokenData?.client_secret?.value
      if (!isVoiceEnabled() || !clientSecret) {
        if (bootTimerRef.current) {
          clearTimeout(bootTimerRef.current)
          bootTimerRef.current = null
        }
        setStatus('fallback')
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (e) {
        console.error('mic', e)
        setStatus('fallback')
        return
      }
      if (cancelled) return

      pc = new RTCPeerConnection({
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
        iceTransportPolicy: 'all',
      })
      pcRef.current = pc
      stream.getTracks().forEach((track) => pc!.addTrack(track, stream!))
      dc = pc.createDataChannel('oai-events')
      const audioEl = new Audio()
      audioEl.autoplay = true
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0]
      }

      dc.onmessage = (e) => {
        let msg: any
        try {
          msg = JSON.parse(e.data)
        } catch {
          return
        }
        if (msg.type === 'response.output_text.delta') {
          modelTextRef.current += msg.delta ?? ''
        } else if (msg.type === 'response.completed' || msg.type === 'response.output_text.done') {
          const raw = modelTextRef.current.trim()
          modelTextRef.current = ''
          if (!raw) return
          try {
            const turn = IntakeTurnZ.parse(JSON.parse(raw))
            currentIdRef.current = turn.field_id
            setCurrentQuestion(turn.next_question)
            setActiveSection(getSection(turn.field_id))
            track?.('question_shown', { id: turn.field_id, priority: 'P1' })
          } catch (err) {
            console.error('parse', err)
            setStatus('error')
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
            track?.('answer_saved', { id: currentIdRef.current, priority: 'P1' })
          } else if (msg.item?.role === 'assistant' && currentQuestion === '') {
            router.replace('/start/processing')
          }
        }
      }

      dc.onopen = () => {
        dc!.send(
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
      const res = await fetch('/api/realtime/offer', {
        method: 'POST',
        headers: { 'content-type': 'application/sdp', authorization: `Bearer ${clientSecret}` },
        body: offer.sdp || '',
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        console.error('offer failed', errText)
        setStatus('fallback')
        return
      }
      const answer = { type: 'answer', sdp: await res.text() }
      await pc.setRemoteDescription(answer as RTCSessionDescriptionInit)
      if (bootTimerRef.current) {
        clearTimeout(bootTimerRef.current)
        bootTimerRef.current = null
      }
      setStatus('ready')
    }
    start()
    return () => {
      cancelled = true
      try {
        if (bootTimerRef.current) {
          clearTimeout(bootTimerRef.current)
          bootTimerRef.current = null
        }
        dc?.close()
        pc?.close()
        stream?.getTracks().forEach((t) => t.stop())
      } catch {}
    }
  }, [])

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

      {status === 'booting' && <p className="text-xs text-muted-foreground">Starting voice…</p>}
      {status === 'fallback' && <p className="text-xs">Voice is warming up — using text prompts for now.</p>}
      {status === 'error' && <p className="text-xs text-red-600">Couldn’t start voice. You can still tap to answer.</p>}

      <main className="flex flex-col items-center gap-4">
        <p className="mt-2 text-center text-base">{currentQuestion}</p>
      </main>

      <ChatCaptions text={captions} />
      {showDiag && (
        <div className="fixed bottom-2 left-2 text-[11px] px-2 py-1 rounded-md bg-black/80 text-white">
          status: {status}
        </div>
      )}
    </div>
  )
}
