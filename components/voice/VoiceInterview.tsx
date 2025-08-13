'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatCaptions from '@/components/ai/ChatCaptions'
import MicButton from './MicButton'
import { moss } from '@/lib/ai/phrasing'
import { listenOnce, speak, startVoiceSession } from '@/lib/voice/session'
import { nluParse } from '@/lib/intake/nlu'
import { buildQuestionQueue } from '@/lib/intake/engine'
import { getSection } from '@/lib/intake/sections'
import type { Answers } from '@/lib/intake/types'
import { track } from '@/lib/analytics'

const PROMPTS: Record<string, string> = {
  style_primary: 'How would you describe your style?',
  mood_words: 'Give up to three mood words.',
  dark_stance: 'How do you feel about dark colors?',
  dark_locations: 'Where could we use dark colors?',
  room_type: 'Which room are we working on?',
  light_level: 'How is the light in this room?',
  window_aspect: 'Which direction do the windows face?',
  constraints: 'Any constraints or rules we should know about?',
  avoid_colors: 'Any colors to avoid?',
  adjacent_primary_color: 'What color is the adjacent room?',
  K1: 'Tell me about your kitchen details.',
  K1a: 'Any more kitchen details?',
  B1: 'Tell me about your bathroom details.',
  B1a: 'Any more bathroom details?',
  L1: 'Tell me about your living area.',
  L1a: 'Any more living area details?',
  O1: 'Tell me about the open concept space.',
  O2: 'Any specific zones in the open space?',
  N1: 'Tell me about the kids room.',
  H1: 'Tell me about the hallway or entry.',
}

function promptFor(id: string): string {
  return PROMPTS[id] || id
}

export default function VoiceInterview() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Answers>({})
  const [queue, setQueue] = useState<string[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [activeSection, setActiveSection] = useState<'style' | 'room'>('style')
  const [captions, setCaptions] = useState('')
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    startVoiceSession()
    speak(moss.greet())
    const q = buildQuestionQueue({})
    setQueue(q)
    if (q.length) {
      const id = q[0]
      setCurrentId(id)
      setCurrentQuestion(promptFor(id))
      const section = getSection(id)
      setActiveSection(section)
      track('question_shown', { id, priority: 'P1' })
      speak(moss.ask(promptFor(id)))
    } else {
      speak(moss.complete())
      router.replace('/start/processing')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function advance(a: Answers) {
    const q = buildQuestionQueue(a)
    setQueue(q)
    if (!q.length) {
      speak(moss.complete())
      router.replace('/start/processing')
      return
    }
    const id = q[0]
    setCurrentId(id)
    setCurrentQuestion(promptFor(id))
    const section = getSection(id)
    setActiveSection(section)
    track('question_shown', { id, priority: 'P1' })
    speak(moss.ask(promptFor(id)))
  }

  async function processAnswer(text: string) {
    if (!currentId) return
    const parsed = nluParse(currentId, text)
    const a = { ...answers, [currentId]: parsed }
    setAnswers(a)
    track('answer_saved', { id: currentId, priority: 'P1' })
    advance(a)
  }

  async function handleMic() {
    if (!currentId) return
    setIsListening(true)
    const text = await listenOnce()
    setCaptions(text)
    setIsListening(false)
    await processAnswer(text)
  }

  async function handleNotSure() {
    if (!currentId) return
    setCaptions('')
    await processAnswer('not sure')
  }

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
        <MicButton onClick={handleMic} isListening={isListening} />
        <button
          type="button"
          className="text-sm text-ink-subtle"
          onClick={handleNotSure}
        >
          Not sure
        </button>
      </main>

      <ChatCaptions text={captions} />
    </div>
  )
}

