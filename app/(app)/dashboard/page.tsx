import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { getIndexForUser } from '@/lib/db/stories'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="mb-4">You must sign in.</p>
        <Link href="/sign-in" className="rounded-xl px-4 py-2 border inline-block">Sign in</Link>
      </main>
    )
  }

  let stories: any[] = []
  try {
  stories = await getIndexForUser(user.id)
  } catch {}

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      <section className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] mb-2">Your Color Stories</h1>
            <p className="text-sm text-[var(--ink-subtle)]">Generate, view, and refine saved palettes.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/start" className="btn btn-primary">New Story</Link>
            <a href="/designers" className="btn btn-secondary">Designers</a>
          </div>
        </header>
      </section>
      <StoriesSection stories={stories} />
      <div className="text-xs text-[var(--ink-subtle)]">Dev: <Link href="/test-upload" className="underline">Test upload</Link></div>
    </main>
  )
}

function StoriesSection({ stories }: { stories:any[] }) {
  const brandOptions = ['All','SW','Behr'] as const
  // simple inline filtering on client after hydration (progressive enhancement could be added)
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="font-display text-2xl">Color Stories</h2>
        <form className="flex flex-wrap gap-3 items-center text-sm" role="search" aria-label="Filter stories">
          <div className="flex gap-2 bg-[var(--bg-surface)] rounded-full px-2 py-1 border border-[var(--border)]">
            {brandOptions.map(b => (
              <button key={b} type="button" data-brand={b} className="px-3 py-1 rounded-full hover:bg-[color:rgba(0,0,0,.04)] text-[11px] font-medium" aria-pressed={b==='All'}>{b}</button>
            ))}
          </div>
          <div className="relative">
            <input type="search" placeholder="Search title" className="text-sm rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 focus:outline-none focus:ring-0" />
          </div>
        </form>
      </div>
      {stories.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] p-10 text-center text-sm text-[var(--ink-subtle)]">No stories yet. Start one above.</div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(s => {
            const hasVariants = !!s.hasVariants
            return (
              <li key={s.id} className="group relative rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-sm transition">
                <Link href={`/reveal/${s.id}`} className="absolute inset-0" aria-label={`Open story ${s.title}`} />
                <div className="flex gap-1 mb-3">
                  {(s.palette||[]).slice(0,5).map((pc:any,i:number)=>(<span key={i} className="h-7 w-7 rounded-md border border-[var(--border)]" style={{background:pc.hex}} aria-hidden />))}
                </div>
                <div className="font-medium mb-0.5 pr-4 line-clamp-1 flex items-center gap-2">
                  {s.title}
                  {hasVariants && <span className="text-[9px] px-1 py-0.5 rounded-full bg-emerald-100 text-emerald-700">VAR</span>}
                </div>
                <div className="text-[11px] text-[var(--ink-subtle)]">{s.brand} · {s.vibe}</div>
                <div className="text-[10px] text-[var(--ink-subtle)] mt-1">{new Date(s.created_at).toLocaleDateString()}</div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}