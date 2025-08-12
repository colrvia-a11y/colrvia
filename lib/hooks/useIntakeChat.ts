'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface IntakeNode {
  question?: string
  options?: string[]
  [key: string]: any
}

export interface UseIntakeChat {
  currentNode: IntakeNode | null
  input: string
  setInput: (v: string) => void
  busy: boolean
  done: boolean
  statusText: string | null
  submit: (value?: string) => Promise<void>
}

export function useIntakeChat(designerId: string): UseIntakeChat {
  const router = useRouter()
  const startedRef = useRef(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentNode, setCurrentNode] = useState<IntakeNode | null>(null)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)
  const API_MODE = process.env.NEXT_PUBLIC_ONBOARDING_MODE === 'api'

  useEffect(() => {
    if (!API_MODE || startedRef.current) return
    startedRef.current = true
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/intakes/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ designerId })
        })
        const j = await r.json().catch(() => null)
        if (!alive) return
        setSessionId(j?.sessionId ?? null)
        setCurrentNode(j?.step?.type === 'question' ? j.step.node : null)
      } catch {}
    })()
    return () => {
      alive = false
    }
  }, [designerId, API_MODE])

  async function submit(value?: string) {
    const v = (value ?? input).trim()
    if (!v || busy || done) return
    if (!API_MODE) return
    if (!sessionId || !currentNode) return
    setBusy(true)
    try {
      const r = await fetch('/api/intakes/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answer: v })
      })
      const j = await r.json().catch(() => null)
      if (j?.step?.type === 'question') {
        setCurrentNode(j.step.node)
        setInput('')
        setBusy(false)
        return
      }
      setStatusText('Great — generating your palette now…')
      const fin = await fetch('/api/intakes/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      const data = await fin.json().catch(() => null)
      let create: Response | null = null
      try {
        create = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designerKey: designerId,
            brand: data?.input?.brand,
            vibe: Array.isArray(data?.input?.vibe)
              ? data.input.vibe.join(' ')
              : data?.input?.vibe,
            palette_v2: data?.palette_v2,
            seed: `intake:${sessionId}`
          })
        })
      } catch {}
      if (!create) {
        setStatusText('Something went wrong')
        setBusy(false)
        return
      }
      if (create.status === 401) {
        router.push('/sign-in')
        return
      }
      if (!create.ok) {
        setStatusText('Could not create story')
        setBusy(false)
        return
      }
      const story = await create.json().catch(() => null)
      if (story?.id) {
        setDone(true)
        router.push(`/reveal/${story.id}`)
      } else {
        setStatusText('Could not create story')
        setBusy(false)
      }
    } catch (e) {
      console.error('ONBOARDING_API_FLOW_FAIL', e)
      setBusy(false)
    }
  }

  return { currentNode, input, setInput, busy, done, statusText, submit }
}

