"use client"
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentNode, mapAnswersToStoryInput, type InterviewState } from '@/lib/ai/onboardingGraph'

export default function OnboardingChat({ designerId }: { designerId: string }) {
  const router = useRouter()
  const [state, setState] = React.useState<InterviewState | null>(null)
  const [utterance, setUtterance] = React.useState('')
  const [input, setInput] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [statusText, setStatusText] = React.useState<string | null>(null)

  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/ai/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ designerId, step: 'start' }),
        })
        const j = await r.json().catch(() => null)
        if (!alive) return
        setState(j?.state ?? null)
        setUtterance(j?.utterance ?? '')
      } catch {}
    })()
    return () => {
      alive = false
    }
  }, [designerId])

  async function submit(value?: string) {
    const v = (value ?? input).trim()
    if (!v || !state || busy) return
    setBusy(true)
    try {
      const r = await fetch('/api/ai/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designerId, step: 'answer', content: v, state }),
      })
      const j = await r.json().catch(() => null)
      setState(j?.state ?? null)
      setUtterance(j?.utterance ?? '')
      setInput('')
      if (j?.state?.done) {
        setStatusText('Great — generating your palette now…')
        try {
          const payload = mapAnswersToStoryInput(j.state.answers)
          const create = await fetch('/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ designerKey: designerId, ...payload }),
          })
          const data = await create.json().catch(() => null)
          if (create.ok && data?.id) {
            router.push(`/reveal/${data.id}`)
          } else {
            setStatusText('Could not create story')
          }
        } catch {
          setStatusText('Could not create story')
        }
      }
    } finally {
      setBusy(false)
    }
  }

  const currentNode = state && !state.done ? getCurrentNode(state) : null

  return (
    <div role="dialog" aria-label="Preferences chat" className="rounded-2xl border border-white/15 bg-white/5 p-4 text-white/95">
      <div className="min-h-[120px]">
        {utterance ? <p className="text-base md:text-lg">{utterance}</p> : <p className="opacity-80">Preparing questions…</p>}
        {statusText && <p className="mt-2 text-sm opacity-80">{statusText}</p>}
      </div>
      {Array.isArray(currentNode?.options) && currentNode.options.length > 0 && !state?.done && (
        <div className="mt-3 flex flex-wrap gap-2">
          {currentNode.options.map((o: string) => (
            <button
              key={o}
              disabled={busy}
              onClick={() => submit(o)}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm hover:bg-white/15 disabled:opacity-50"
            >
              {o}
            </button>
          ))}
        </div>
      )}
      {!state?.done && (
        <div className="mt-4 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit(input)
            }}
            disabled={busy}
            placeholder="Say it or type it…"
            className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/60"
          />
          <button
            onClick={() => submit(input)}
            disabled={!input || busy}
            className="rounded-xl bg-white/20 px-3 py-2 text-sm hover:bg-white/25 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}
