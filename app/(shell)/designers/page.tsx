import DesignersCarousel from '@/components/ai/DesignersCarousel'

export default function DesignersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Choose your designer</h1>
        <p className="text-[var(--ink-subtle)]">This lens guides your preferences interview. Swipe to explore styles.</p>
      </header>
      <DesignersCarousel />
    </main>
  )
}
