'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'

// Force dynamic rendering so Next.js doesn't attempt to pre-render and error on useSearchParams
export const dynamic = 'force-dynamic'

function StartInterviewInner() {
  const sp = useSearchParams()
  const router = useRouter()
  const designer = (sp.get('designer') ?? 'emily') as 'emily'|'zane'|'marisol'
  const [answers, setAnswers] = useState({ lighting: '', mood: '', style: '', floor: '', accent: '' })
  const [busy, setBusy] = useState(false)

  async function go(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ designer, answers }) })
    const data = await res.json()
    localStorage.setItem('colrvia:lastStory', JSON.stringify(data.story))
    router.push('/reveal')
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-2">Quick interview</h1>
      <p className="text-neutral-600 mb-6">Just 5 prompts to tune your palette.</p>
      <form onSubmit={go} className="space-y-4">
        {Object.entries(answers).map(([key, val]) => (
          <div key={key}>
            <label className="block text-sm mb-1 capitalize">{key}</label>
            <input value={val} onChange={e => setAnswers(a => ({ ...a, [key]: e.target.value }))} className="w-full border rounded-xl px-3 py-2" placeholder="Type your answer..." required />
          </div>
        ))}
        <button disabled={busy} className="w-full rounded-2xl py-3 bg-black text-white">{busy ? 'Working…' : 'Generate my Color Story'}</button>
      </form>
    </main>
  )
}

export default function StartInterview() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-xl p-6"><p className="text-neutral-600">Loading…</p></main>}>
      <StartInterviewInner />
    </Suspense>
  )
}
