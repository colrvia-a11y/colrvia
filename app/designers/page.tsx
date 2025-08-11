import DesignersCarousel from '@/components/ai/DesignersCarousel'

export default function DesignersPage() {
  return (
  <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
    <h1 className="text-3xl font-semibold tracking-tight">Pick your designer</h1>
    <p className="text-[var(--ink-subtle)]">Three styles. Same great taste—swipe to choose who you vibe with.</p>
      </header>
	<DesignersCarousel />
    </main>
  )
}
