'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type InterviewState, getCurrentNode, mapAnswersToStoryInput } from '@/lib/ai/onboardingGraph'

export interface UsePreferencesChat {
  currentNode: ReturnType<typeof getCurrentNode> | null
  utterance: string
  input: string
  setInput: (v: string) => void
  busy: boolean
  done: boolean
  statusText: string | null
  submit: (value?: string) => Promise<void>
}

export function usePreferencesChat(designerId: string): UsePreferencesChat {
  const router = useRouter()
  const [state, setState] = useState<InterviewState | null>(null)
  const [utterance, setUtterance] = useState('')
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const r = await fetch('/api/ai/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ designerId, step: 'start' })
        })
        const j = await r.json().catch(() => null)
        if (!active) return
        setState(j?.state ?? null)
        setUtterance(j?.utterance ?? '')
      } catch {}
    })()
    return () => {
      active = false
    }
  }, [designerId])

  async function submit(value?: string) {
    const v = (value ?? input).trim()
    if (!v || busy || done || !state) return
    setBusy(true)
    try {
      const r = await fetch('/api/ai/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designerId, step: 'answer', content: v, state })
      })
      const j = await r.json().catch(() => null)
      setState(j?.state ?? null)
      setUtterance(j?.utterance ?? '')
      setInput('')
      if (j?.state?.done) {
        setDone(true)
        setStatusText('Great — generating your palette now…')
        const storyInput = mapAnswersToStoryInput(j.state.answers)
        let create: Response | null = null
        try {
          create = await fetch('/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ designerKey: designerId, ...storyInput, seed: `ai:${Date.now()}` })
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
          router.push(`/reveal/${story.id}`)
        } else {
          setStatusText('Could not create story')
          setBusy(false)
        }
      } else {
        setBusy(false)
      }
    } catch {
      setBusy(false)
    }
  }

  const currentNode = state ? getCurrentNode(state) : null
  return { currentNode, utterance, input, setInput, busy, done, statusText, submit }
}
