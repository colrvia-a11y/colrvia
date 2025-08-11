import Link from 'next/link'
import { designers, type Designer } from '@/lib/ai/designers'

export default function DesignersPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Pick Your AI Designer</h1>
        <p className="text-[var(--ink-subtle)]">Three styles. Same great taste. Choose who you vibe with.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {designers.map((d:Designer) => (
          <div key={d.id} className="group rounded-2xl shadow-sm border border-linen hover:shadow-md transition-shadow card p-5 flex flex-col">
            <div className="text-5xl mb-3" aria-hidden>{d.avatar}</div>
            <h2 className="text-xl font-medium">{d.name}</h2>
            <p className="text-sm text-[var(--ink-subtle)] mb-4">{d.tagline}</p>
            <div className="mt-auto">
              <Link href={`/onboarding/${d.id}`} aria-label={`Start with ${d.name}`} className="inline-flex w-full justify-center rounded-[var(--radius)] bg-brand text-brand-contrast px-3 py-2 text-sm font-medium hover:bg-brand-hover">Start with {d.short}</Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
