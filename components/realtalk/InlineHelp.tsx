import React, { useState } from 'react'
import type { Answers } from '@/lib/realtalk/types'

type Props = { questionText: string; answers: Answers }

export default function InlineHelp({ questionText, answers }: Props){
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState<string | null>(null)

  async function load(){
    setOpen(true)
    if (text || loading) return
    setLoading(true)
    try {
      const r = await fetch('/api/ai/explain', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ questionText, answers })
      })
      const data = await r.json()
      setText(data.explanation)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rt-inline-help">
      <button type="button" className="rt-help-link" onClick={load}>Why this question?</button>
      {open && (
        <div className={`rt-help-box ${loading ? 'is-loading' : ''}`} aria-live="polite">{loading ? 'Loading…' : text}</div>
      )}
      <style jsx>{`
        .rt-help-link { color: var(--color-fg-muted); text-decoration: underline; font-size: var(--text-sm); }
        .rt-help-box { margin-top: var(--space-3); border:1px solid var(--color-border); padding: var(--space-4); border-radius: var(--radius-md); background: var(--color-bg-inset); }
        .rt-help-box.is-loading { color: transparent; position: relative; }
        .rt-help-box.is-loading::before { content:''; position:absolute; inset:0; background:linear-gradient(90deg,var(--color-bg-alt),var(--color-bg),var(--color-bg-alt)); background-size:200% 100%; animation: shimmer 1.5s ease-in-out infinite; }
        @keyframes shimmer { from { background-position:200% 0;} to {background-position:-200% 0;} }
      `}</style>
    </div>
  )
}
