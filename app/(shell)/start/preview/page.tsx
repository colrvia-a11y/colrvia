export const dynamic = 'force-dynamic'
import Link from 'next/link'

export default function PreviewPage(){
  // Placeholder: would fetch latest draft palette from server / intakes
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <header>
        <h1 className="font-display text-4xl leading-[1.05] mb-4">Preview</h1>
  <p className="text-sm text-muted-foreground">First pass palette & placements (placeholder). Save to finalize.</p>
      </header>
  <div className="rounded-2xl border p-6 bg-[var(--bg-surface)] text-sm text-muted-foreground">Palette preview coming soon.</div>
      <div className="flex gap-3">
        <Link href="/reveal/temp-id" className="btn btn-primary">Save & Reveal</Link>
        <Link href="/start/preferences?designerId=emily" className="btn btn-secondary">Refine preferences</Link>
      </div>
    </main>
  )
}
