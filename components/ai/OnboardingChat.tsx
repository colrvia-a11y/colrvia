'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingChat({ designerId }: { designerId: string }) {
  const router = useRouter()
  const startedRef = React.useRef(false)
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [currentNode, setCurrentNode] = React.useState<any | null>(null)
  const [input, setInput] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [statusText, setStatusText] = React.useState<string | null>(null)
  const API_MODE = process.env.NEXT_PUBLIC_ONBOARDING_MODE === 'api'

  React.useEffect(() => {
    if (!API_MODE || startedRef.current) return
    startedRef.current = true
    let alive = true
    ;(async () => {
      const r = await fetch('/api/intakes/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designerId })
      })
      const j = await r.json().catch(() => null)
      if (!alive) return
      setSessionId(j?.sessionId ?? null)
      setCurrentNode(j?.step?.type === 'question' ? j.step.node : null)
    })()
    return () => { alive = false }
  }, [designerId])

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
              palette_v2: data?.palette_v2,
              seed: `intake:${sessionId}`
            })
          })
        } catch {}
        const story = create ? await create.json().catch(() => null) : null
      setDone(true)
      if (story?.id) router.push(`/reveal/${story.id}`)
    } catch (e) {
      console.error('ONBOARDING_API_FLOW_FAIL', e)
      setBusy(false)
    }
  }

  function onQuickReply(v: string) {
    submit(v)
  }

  if (!API_MODE) return null

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-white/95">
      <div className="min-h-[120px]">
        {currentNode?.question ? (
          <p className="text-base md:text-lg">{currentNode.question}</p>
        ) : (
          <p className="opacity-80">Preparing questions…</p>
        )}
        {statusText && <p className="mt-2 text-sm opacity-80">{statusText}</p>}
      </div>
      {Array.isArray(currentNode?.options) && currentNode.options.length > 0 && !done && (
        <div className="mt-3 flex flex-wrap gap-2">
          {currentNode.options.map((o: string) => (
            <button
              key={o}
              disabled={busy}
              onClick={() => onQuickReply(o)}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm hover:bg-white/15 disabled:opacity-50"
            >
              {o}
            </button>
          ))}
        </div>
      )}
      {!done && (
        <div className="mt-4 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(input) }}
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
