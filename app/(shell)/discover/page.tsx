export const dynamic = 'force-dynamic'
import Link from 'next/link'

export default function DiscoverPage(){
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <header>
        <h1 className="font-display text-4xl leading-[1.05] mb-4">Discover</h1>
  <p className="text-sm text-muted-foreground max-w-md">Inspiration & fresh palettes. (Placeholder content)</p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length:6 }).map((_,i)=> (
          <Link key={i} href="/start" className="rounded-xl border p-6 hover:shadow-sm transition-shadow">
            <div className="h-24 rounded-md bg-gradient-to-br from-linen to-paper mb-4" />
            <h2 className="font-semibold mb-1">Mood {i+1}</h2>
            <p className="text-xs text-muted-foreground">Tap to start with this vibe.</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
