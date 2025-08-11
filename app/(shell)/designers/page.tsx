export const dynamic = 'force-dynamic'

import DesignersGrid from '@/components/ai/DesignersGrid'

export default function DesignersPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <header>
        <h1 className="font-display text-4xl leading-[1.05] mb-4">Meet our designers</h1>
        <p className="text-sm text-[var(--ink-subtle)] max-w-md">Choose a style lens to guide your picks.</p>
      </header>
      <DesignersGrid />
    </main>
  )
}
