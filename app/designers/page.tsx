import { DESIGNERS } from '@/data/designers'
import DesignerCard from '@/components/DesignerCard'

export default function DesignersPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-2">Choose your designer</h1>
      <p className="text-neutral-600 mb-6">Pick a vibe to guide your palette and narrative.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {DESIGNERS.map(d => <DesignerCard key={d.id} d={d} />)}
      </div>
    </main>
  )
}
