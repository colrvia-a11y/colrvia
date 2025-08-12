"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import QuestionRenderer from '@/components/assistant/QuestionRenderer'
import { startState, acceptAnswer, getCurrentNode, mapAnswersToStoryInput, type InterviewState } from '@/lib/ai/onboardingGraph'

export default function IntakePage() {
  const router = useRouter()
  const [state, setState] = React.useState<InterviewState>(startState())
  const [status, setStatus] = React.useState<string | null>(null)

  const node = !state.done ? getCurrentNode(state) : undefined
  const turn = node
    ? {
        field_id: node.key,
        next_question: node.prompt,
        input_type:
          node.type === 'single_select'
            ? 'singleSelect'
            : node.type === 'multi_select'
            ? 'multiSelect'
            : node.type === 'yesno'
            ? 'yesNo'
            : 'text',
        choices: node.options,
      }
    : null

  const handleAnswer = async (ans: string) => {
    const next = acceptAnswer(state, ans)
    setState(next)
    if (next.done) {
      setStatus('Great — generating your palette now…')
      try {
        const payload = mapAnswersToStoryInput(next.answers)
        const resp = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ designerKey: 'therapist', ...payload }),
        })
        const story = await resp.json().catch(() => null)
        if (resp.ok && story?.id) {
          router.push(`/reveal/${story.id}`)
        } else {
          setStatus('Could not create story')
        }
      } catch {
        setStatus('Could not create story')
      }
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Color Therapist Intake</h1>
      {turn && <QuestionRenderer turn={turn} onAnswer={handleAnswer} />}
      {status && <p className="text-sm text-neutral-600">{status}</p>}
    </main>
  )
}
