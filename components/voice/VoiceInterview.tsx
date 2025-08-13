'use client'

import { useEffect, useState } from 'react'
import ChatCaptions from '@/components/ai/ChatCaptions'
import MicButton from './MicButton'
import { moss } from '@/lib/ai/phrasing'
import { listenOnce, speak, startVoiceSession } from '@/lib/voice/session'

export default function VoiceInterview() {
  const [activeSection] = useState<'style' | 'room'>('style')
  const [currentQuestion] = useState('How would you describe your style?')
  const [captions, setCaptions] = useState('')
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    startVoiceSession()
    speak(moss.greet())
  }, [])

  async function handleMic() {
    setIsListening(true)
    const text = await listenOnce()
    setCaptions(text)
    setIsListening(false)
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
        <button type="button" className="text-sm text-ink-subtle">
          Not sure
        </button>
      </main>

      <ChatCaptions text={captions} />
    </div>
  )
}

