"use client"
import { useEffect, useRef, useState } from 'react'
import { Card, Button } from '@/components/ui'
import { track } from '@/lib/analytics'

export default function NarrativeCard({ storyId }: { storyId: string }) {
  const [text, setText] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const r = await fetch(`/api/stories/${encodeURIComponent(storyId)}/narrative`, { cache: 'no-store' })
        const j = await r.json().catch(() => ({}))
        if (!ignore && typeof j?.narrative === 'string') {
          setText(j.narrative)
          track('explanation_view', { from: 'reveal', hasText: j.narrative.length > 0 })
        }
      } catch {}
    })()
    return () => {
      ignore = true
      if (utteranceRef.current) {
        try { window.speechSynthesis.cancel() } catch {}
      }
    }
  }, [storyId])

  function copy() {
    if (!text) return
    try { navigator.clipboard?.writeText(text) } catch {}
    track('explanation_copy', { len: text.length })
  }

  function listen() {
    if (!text) return
    try {
      if (speaking) {
        window.speechSynthesis.cancel()
        setSpeaking(false)
        return
      }
      const u = new SpeechSynthesisUtterance(text)
      u.onend = () => setSpeaking(false)
      utteranceRef.current = u
      window.speechSynthesis.speak(u)
      setSpeaking(true)
      track('explanation_listen', { len: text.length })
    } catch {}
  }

  if (!text) return null

  return (
    <Card className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm">
      <h2 className="text-base font-medium mb-2">Why this palette works</h2>
      <p className="text-sm leading-6 text-[var(--ink-subtle)] whitespace-pre-line">{text}</p>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" onClick={copy}>Copy</Button>
        <Button variant="primary" onClick={listen} aria-pressed={speaking}>{speaking ? 'Stop' : 'Listen'}</Button>
      </div>
    </Card>
  )
}
