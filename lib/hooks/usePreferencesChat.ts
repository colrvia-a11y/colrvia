'use client'

import { useEffect, useState } from 'react'
import type { Answers } from '@/lib/intake/types'
import type { QuestionId } from '@/lib/intake/questions'

export interface UsePreferencesChat {
  currentQuestion: string
  choices: string[] | null
  input: string
  setInput: (v: string) => void
  busy: boolean
  done: boolean
  statusText: string | null
  submit: (value?: string) => Promise<void>
  storyId: string | null
}

export function usePreferencesChat(designerId: string): UsePreferencesChat {
  const [answers, setAnswers] = useState<Answers>({})
  const [currentId, setCurrentId] = useState<QuestionId | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [choices, setChoices] = useState<string[] | null>(null)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)
  const [storyId, setStoryId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const r = await fetch('/api/ai/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: {}, designerId }),
        })
        const j = await r.json().catch(() => null)
        if (!active) return
        if (j?.turn) {
          setCurrentId(j.turn.field_id)
          setCurrentQuestion(j.turn.next_question)
          setChoices(j.turn.choices || null)
        }
      } catch {}
    })()
    return () => {
      active = false
    }
  }, [designerId])

  async function submit(value?: string) {
    const v = (value ?? input).trim()
    if (!v || busy || done || !currentId) return
    setBusy(true)
    const newAnswers = { ...answers, [currentId]: v }
    try {
      const r = await fetch('/api/ai/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers, designerId, last_question: currentId, last_answer: v }),
      })
      const j = await r.json().catch(() => null)
      setAnswers(newAnswers)
      setInput('')
      if (j?.turn) {
        setCurrentId(j.turn.field_id)
        setCurrentQuestion(j.turn.next_question)
        setChoices(j.turn.choices || null)
        setBusy(false)
      } else {
        setDone(true)
        setStatusText('Great — generating your palette now…')
        try {
          const create = await fetch('/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ designerKey: designerId, ...newAnswers, seed: `chat:${Date.now()}` }),
          })
          const story = await create.json().catch(() => null)
          if (create.ok && (story?.id || story?.story?.id)) {
            const id = story.id || story.story.id
            setStoryId(id)
            setStatusText('Your palette is ready!')
          } else {
            setStatusText('Could not create story')
          }
        } catch {
          setStatusText('Something went wrong')
        }
        setBusy(false)
      }
    } catch {
      setBusy(false)
    }
  }

  return { currentQuestion, choices, input, setInput, busy, done, statusText, submit, storyId }
}

