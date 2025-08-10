'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import type { ColorStory } from '@/types/colorStory'

export default function SaveStoryToProject() {
  const router = useRouter()
  const [story, setStory] = useState<ColorStory | null>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [auth, setAuth] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('colrvia:lastStory') : null
    if (raw) setStory(JSON.parse(raw))
  }, [])

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/projects', { cache: 'no-store' })
        if (res.status === 401) {
          setAuth(false)
        } else if (res.ok) {
          const list = await res.json()
          setProjects(list)
          if (list.length) setSelected(list[0].id)
          setAuth(true)
        } else {
          setError('Could not load projects')
        }
      } catch {
        setError('Network error loading projects')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function createProject() {
    const name = prompt('Project name?')
    if (!name) return
    try {
      const res = await fetch('/api/projects', { method: 'POST', body: JSON.stringify({ name }) })
      if (res.ok) {
        const p = await res.json()
        setProjects(ps => [p, ...ps])
        setSelected(p.id)
      } else {
        alert('Failed to create project')
      }
    } catch {
      alert('Network error')
    }
  }

  async function save() {
    if (!story || !selected) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${selected}/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story })
      })
      if (res.ok) {
  router.push(`/reveal/${story.id}`)
      } else if (res.status === 401) {
        setAuth(false)
        setError('Please sign in.')
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Failed to save story')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (auth === false) {
    return (
      <div className="mt-8 p-4 rounded-2xl border">
        <p className="text-sm mb-3">Sign in to save this Color Story to a project.</p>
        <Link href="/sign-in" className="rounded-xl px-4 py-2 bg-black text-white inline-block text-sm">Sign in</Link>
      </div>
    )
  }

  return (
    <div className="mt-10 p-4 rounded-2xl border space-y-4 max-w-2xl mx-auto">
      <h2 className="font-medium">Save to Project</h2>
      {!story && <p className="text-sm text-neutral-500">Generate a story first.</p>}
      {story && (
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-neutral-500">Loading projects…</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-neutral-500">No projects yet.</p>
          ) : (
            <select value={selected} onChange={e => setSelected(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm">
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={!story || !selected || saving} className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-50 text-sm">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={createProject} type="button" className="text-sm underline">+ New project</button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
