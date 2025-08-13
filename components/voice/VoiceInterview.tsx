'use client'

import React, { useEffect } from 'react'
import { buildQuestionQueue } from '@/lib/intake/engine'
import { moss } from '@/lib/ai/phrasing'
import { speak } from '@/lib/voice/session'
import { nluParse } from '@/lib/intake/nlu'

export default function VoiceInterview() {
  const answers: Record<string, any> = {}
  const queue = buildQuestionQueue(answers)
  const currentId = queue[0]

  useEffect(() => {
    if (!currentId) return
    speak(moss.ask(currentId))
  }, [currentId])

  async function onTranscript(text: string) {
    const normalized = nluParse(currentId, text)
    answers[currentId] = normalized
  }

  return (
    <div className="voice-shell">
      <p>{moss.greet()}</p>
      <span>Room 1/4</span>
    </div>
  )
}
