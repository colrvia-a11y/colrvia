import DesignersGrid from '@/components/ai/DesignersGrid'

export default function DesignersPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Pick Your AI Designer</h1>
        <p className="text-[var(--ink-subtle)]">Three styles. Same great taste. Choose who you vibe with.</p>
      </header>
  <DesignersGrid />
    </main>
  )
}
