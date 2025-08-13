"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProjectForm() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (!res.ok) throw new Error('Failed to create project')
      setName('')
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-describedby="np-help">
      <label htmlFor="project-name" className="text-sm font-medium text-neutral-700">
        Project name
      </label>
      <input
        id="project-name"
        type="text"
        placeholder="e.g., Living room refresh"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full rounded-xl border px-3 py-2"
        disabled={loading}
        required
        aria-describedby="np-help"
      />
      <p id="np-help" className="text-xs text-neutral-500">You can rename this later.</p>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl px-4 py-2 border"
      >
        {loading ? 'Creating…' : 'Create project'}
      </button>
    </form>
  )
}
