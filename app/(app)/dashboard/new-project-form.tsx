"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProjectForm() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create project')
      }
  setName('')
  router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
  <form onSubmit={onSubmit} className="space-y-3 max-w-sm">
      <div className="space-y-1">
        <label htmlFor="project-name" className="text-sm font-medium">New Project</label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Project name"
          className="w-full border rounded px-2 py-1 text-sm bg-white"
          disabled={loading}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !name.trim()}
  className="inline-flex items-center gap-1 rounded-xl bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create Project'}
      </button>
    </form>
  )
}
