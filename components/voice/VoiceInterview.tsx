'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatCaptions from '@/components/ai/ChatCaptions'
import { IntakeTurnZ } from '@/lib/model-schema'
import type { Answers } from '@/lib/intake/types'
import { track } from '@/lib/analytics'
import { getSection } from '@/lib/intake/sections'
import { QUESTION_PRIORITY, QuestionId } from '@/lib/intake/questions'
import { isVoiceEnabled } from '@/lib/flags'
import VoiceStatusBar from '@/components/voice/VoiceStatusBar'

type BootStatus = 'booting' | 'ready' | 'error' | 'fallback'

// System prompt ensures even smaller realtime models understand their role & flow
const SYSTEM_PROMPT = [
  'You are Moss, an AI color consultant conducting a short voice interview.',
  'Your tone is calm, soothing, and warm.',
  "Begin by greeting the user and introducing yourself as their Color Therapist.",
  "Then ask the first question: 'Which space are we designing? (e.g. Living Room, Kitchen, Bedroom…)'",
  "After each user answer, briefly acknowledge (e.g., 'Got it.' / 'Great.') and ask the next question.",
  "Follow the app's questionnaire order and stop when all questions are answered.",
  'Do not skip the greeting. Stay in character and guide the user through the interview.',
].join(' ')

export default function VoiceInterview() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [activeSection, setActiveSection] = useState<'style' | 'room'>('style')
  const [captions, setCaptions] = useState('')
  const answersRef = useRef<Answers>({})
  const currentIdRef = useRef<string | null>(null)
  const userTextRef = useRef('')
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [status, setStatus] = useState<BootStatus>('booting')
  const [statusReason, setStatusReason] = useState<string | null>(null)
  const bootTimerRef = useRef<number | null>(null)
  const [armed, setArmed] = useState(false) // user tapped Enable Voice
  const [micError, setMicError] = useState<string | null>(null)

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
    // Mirror the API's first turn which prepends the Moss greeting to the first question
    const first =
      "Hello! I’m Moss, your Color Therapist. Let’s get started. Which space are we designing? (e.g. Living Room, Kitchen, Bedroom…)"
    setCurrentQuestion(first)
  }

  useEffect(() => {
    if (!armed) return
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
          if (!statusReason) setStatusReason('timeout waiting for realtime')
        } catch {
          setStatus('error')
          setStatusReason('fallback init failed')
        }
      }, fallbackDelay)

      const tokenRes = await fetch('/api/realtime/session', { method: 'POST' })
      if (!tokenRes.ok) {
        const errText = await tokenRes.text().catch(() => '')
        console.error('session init failed', errText)
        setStatus('fallback')
        setStatusReason(`session ${tokenRes.status} ${errText.slice(0,80)}`)
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
        setStatusReason(!isVoiceEnabled() ? 'voice disabled by flag' : 'missing client_secret')
        return
      }

      // 2) mic (with preflight + better error)
      try {
        // Preflight if supported
        const canCheck =
          typeof navigator !== 'undefined' && (navigator as any).permissions?.query
        if (canCheck) {
          try {
            const p = await (navigator as any).permissions.query({
              name: 'microphone' as any,
            })
            if (p.state === 'denied') {
              setMicError('Microphone is blocked for this site. Tap Fix Microphone for steps.')
              setStatus('fallback')
              return
            }
          } catch {}
        }
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setMicError(null)
      } catch (e: any) {
        console.error('mic', e)
        const name = e?.name || ''
        setMicError(
          name === 'NotAllowedError'
            ? 'Microphone permission was denied. Please allow access in site settings, then try again.'
            : 'Microphone error. Please check permissions and try again.',
        )
        setStatus('fallback')
        setStatusReason(name || 'mic error')
        return
      }
      if (cancelled) return

      pc = new RTCPeerConnection({
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
        iceTransportPolicy: 'all',
      })
      pcRef.current = pc

      // Receive remote audio (voice from the model) and play it
      try {
        pc.addTransceiver('audio', { direction: 'recvonly' })
      } catch {}
      pc.ontrack = (e) => {
        const remote = e.streams?.[0]
        if (audioRef.current && remote) {
          audioRef.current.srcObject = remote
          audioRef.current.play().catch(() => {})
        }
      }

      // Send mic upstream
      const micTrack = stream.getTracks()[0]
      if (micTrack) pc.addTrack(micTrack, stream)

      dc = pc.createDataChannel('oai-events')

      const designerId = 'therapist'

      const askNext = async (last?: { id: string; answer: string }) => {
        try {
          const body: any = { answers: answersRef.current, designerId }
          if (last) {
            body.last_question = last.id
            body.last_answer = last.answer
          }
          const res = await fetch('/api/ai/preferences', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          })
          const data = await res.json().catch(() => ({}))
            if (!data?.turn) {
              currentIdRef.current = null
              setCurrentQuestion('')
              // End-of-interview: never send an empty instruction (some models emit stray adjectives).
              dc?.send(
                JSON.stringify({
                  type: 'response.create',
                  response: {
                    modalities: ['audio', 'text'],
                    instructions:
                      "Thanks! I have what I need. I’m generating your palette now—this takes just a moment.",
                  },
                }),
              )
            try {
              const storyRes = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ designerKey: designerId, answers: answersRef.current, seed: `voice:${Date.now()}` }),
              })
              const story = await storyRes.json().catch(() => null)
              const id = story?.id || story?.story?.id
              router.replace(id ? `/reveal/${id}?optimistic=1` : '/start/interview')
            } catch {
              router.replace('/start/interview')
            }
            return
          }
          const turn = IntakeTurnZ.parse(data.turn)
          currentIdRef.current = turn.field_id
          setCurrentQuestion(turn.next_question)
          setActiveSection(getSection(turn.field_id))
          const pr = QUESTION_PRIORITY[turn.field_id as QuestionId] || 'P4'
          track?.('question_shown', { id: turn.field_id, priority: pr })
          dc?.send(
            JSON.stringify({
              type: 'response.create',
              response: { modalities: ['audio', 'text'], instructions: turn.next_question },
            }),
          )
        } catch (err) {
          console.error('ask', err)
        }
      }

      dc.onmessage = (e) => {
        let msg: any
        try {
          msg = JSON.parse(e.data)
        } catch {
          return
        }
        if (msg.type === 'conversation.item.input_audio.transcription.delta') {
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
            const pr = QUESTION_PRIORITY[currentIdRef.current as QuestionId] || 'P4'
            track?.('answer_saved', { id: currentIdRef.current, priority: pr })
            askNext({ id: currentIdRef.current, answer: t })
          }
        }
      }

        dc.onopen = () => {
          // Prime the model with a clear role BEFORE the first spoken line.
          try {
            dc?.send(
              JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'message',
                  role: 'system',
                  content: [{ type: 'input_text', text: SYSTEM_PROMPT }],
                },
              }),
            )
          } catch (e) {
            console.warn('realtime: failed to send system prompt', e)
          }
          askNext()
        }

      const offer = await pc.createOffer({ offerToReceiveAudio: true })
      await pc.setLocalDescription(offer)
      const res = await fetch('/api/realtime/offer', {
        method: 'POST',
        headers: {
          'content-type': 'application/sdp',
          authorization: `Bearer ${clientSecret}`, // ephemeral token from /api/realtime/session
        },
        body: offer.sdp || '',
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        console.error('offer failed', errText)
        setStatus('fallback')
        setStatusReason(`offer ${res.status} ${errText.slice(0,80)}`)
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
  }, [armed])

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

      <VoiceStatusBar status={status} reason={statusReason} showLink />

      {!armed && (
        <button
          type="button"
          className="mt-2 px-4 py-2 rounded-2xl bg-black text-white"
          onClick={() => {
            setArmed(true)
            setTimeout(() => audioRef.current?.play().catch(() => {}), 0)
          }}
        >
          Enable Voice (Mic)
        </button>
      )}
      {micError && (
        <div className="mt-2 text-xs rounded-xl border p-2">
          {micError}{' '}
          <details className="mt-1">
            <summary className="cursor-pointer">Fix Microphone (iOS & Android)</summary>
            <div className="mt-1 space-y-1">
              <div>iOS Safari: aA → Website Settings → Microphone → Allow, then reload.</div>
              <div>iOS Settings: Privacy & Security → Microphone → enable for Safari/Chrome.</div>
              <div>Chrome: lock icon → Site settings → Microphone → Allow, then reload.</div>
            </div>
          </details>
          <div className="mt-2">
            <button
              type="button"
              className="px-3 py-1 rounded border"
              onClick={() => {
                setArmed(false)
                setTimeout(() => {
                  setArmed(true)
                  setTimeout(() => audioRef.current?.play().catch(() => {}), 0)
                }, 0)
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <main className="flex flex-col items-center gap-4">
        <p className="mt-2 text-center text-base">{currentQuestion}</p>
      </main>

      <ChatCaptions text={captions} />
      {/* Hidden audio element that actually plays the model's voice */}
      <audio ref={audioRef} autoPlay playsInline className="hidden" />
      {showDiag && (
        <div className="fixed bottom-2 left-2 text-[11px] px-2 py-1 rounded-md bg-black/80 text-white">
          status: {status}
        </div>
      )}
    </div>
  )
}
