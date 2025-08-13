export const dynamic = 'force-dynamic'
import Link from 'next/link'

export default function HomeShell(){
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <header>
        <h1 className="font-display text-4xl leading-[1.05] mb-4">Start color story</h1>
        <p className="text-sm text-muted-foreground max-w-md">Designer-led conversation · ~6 minutes · 6–8 quick questions.</p>
      </header>
      <div className="space-y-6">
        <Link href="/start/interview-intro" className="btn btn-primary w-full sm:w-auto">Start color story</Link>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/discover" className="card p-6 hover:shadow-md transition-shadow"><h2 className="font-semibold mb-2">Discover color stories</h2><p className="text-sm text-muted-foreground">Explore recent palettes & reveals.</p></Link>
          <Link href="/how-it-works" className="card p-6 hover:shadow-md transition-shadow"><h2 className="font-semibold mb-2">How it works</h2><p className="text-sm text-muted-foreground">See the process end to end.</p></Link>
        </div>
      </div>
    </main>
  )
}
