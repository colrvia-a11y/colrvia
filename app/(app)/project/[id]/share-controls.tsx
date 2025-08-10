'use client'
import { useEffect, useState } from 'react'

interface ShareState {
  is_public: boolean
  public_slug: string | null
}

export function ShareControls({ projectId }: { projectId: string }) {
  const [state, setState] = useState<ShareState | null>(null)
  const [loading, setLoading] = useState(true)
  const [copyMsg, setCopyMsg] = useState('')
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/share`, { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          if (active) setState(json)
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [projectId])

  async function toggle() {
    if (!state) return
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: !state.is_public })
      })
      if (res.ok) {
        const json = await res.json()
        setState(json)
        setCopyMsg('')
      }
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    if (!state?.is_public || !state.public_slug) return
    const link = `${origin}/share/${state.public_slug}`
    try {
      await navigator.clipboard.writeText(link)
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 2000)
    } catch {
      setCopyMsg('Copy failed')
      setTimeout(() => setCopyMsg(''), 2500)
    }
  }

  if (loading && !state) {
    return <div className="rounded-2xl border p-4 text-sm text-neutral-500">Loading share settings…</div>
  }

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Public sharing</div>
          <div className="text-xs text-neutral-500">Allow anyone with the link to view this Color Story.</div>
        </div>
        <button onClick={toggle} disabled={loading} className="rounded-xl px-4 py-2 border text-sm bg-white disabled:opacity-50">
          {state?.is_public ? 'Disable' : 'Enable'}
        </button>
      </div>
      {state?.is_public && state.public_slug && (
        <div className="space-y-2">
          <div className="text-xs break-all bg-neutral-50 rounded-xl px-3 py-2 border font-mono">{`${origin}/share/${state.public_slug}`}</div>
          <button onClick={copyLink} className="rounded-xl px-4 py-2 bg-black text-white text-sm">Copy link</button>
          {copyMsg && <span className="text-xs text-neutral-500 ml-2">{copyMsg}</span>}
        </div>
      )}
    </div>
  )
}
export default ShareControls
