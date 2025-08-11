import { supabaseServer } from '@/lib/supabase/server'
import { getIndexForUser } from '@/lib/db/stories'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StoriesPage(){
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  let stories: any[] = []
  if (user) {
    try { stories = await getIndexForUser(user.id) } catch {}
  }
  const drafts = stories.filter(s=> !s.title)
  const saved = stories.filter(s=> s.title)
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl leading-[1.05] mb-3">Your Stories</h1>
          <p className="text-sm text-[var(--ink-subtle)] max-w-md">Drafts are unsaved working palettes. Add a title to save.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/start" className="btn btn-primary">Start new</Link>
        </div>
      </header>
      <section className="space-y-5">
        <h2 className="text-sm font-medium tracking-wide uppercase text-[var(--ink-subtle)]">Drafts</h2>
        {drafts.length? <StoriesGrid stories={drafts} /> : <p className="text-xs text-[var(--ink-subtle)]">No drafts.</p>}
      </section>
      <section className="space-y-5">
        <h2 className="text-sm font-medium tracking-wide uppercase text-[var(--ink-subtle)]">Saved</h2>
        {saved.length? <StoriesGrid stories={saved} /> : <p className="text-xs text-[var(--ink-subtle)]">Nothing saved yet.</p>}
      </section>
      {!user && (
        <p className="text-xs text-[var(--ink-subtle)]">Sign in later to save – no account needed to explore.</p>
      )}
    </main>
  )
}

function StoriesGrid({ stories }: { stories:any[] }) {
  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed rounded-2xl border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="w-48 h-32 rounded-2xl bg-gradient-to-br from-linen to-paper mb-8 shadow-soft" aria-hidden />
        <h2 className="font-display text-2xl mb-2">No stories yet</h2>
        <p className="text-sm text-[var(--ink-subtle)] mb-6 max-w-xs">Start your first palette to see it appear here.</p>
        <Link href="/start" className="btn btn-primary">Start a Color Story</Link>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
      {stories.map(s=>{
        const image = s.photoUrl || '/icons/icon-192.png'
        const meta = `${s.vibe} · ${s.brand}`
        const fallback = `Color Story ${s.id.slice(0,6)}`
        const title = s.title || fallback
        return (
          <li key={s.id} className="[&>div]:h-full">
            <Link href={`/reveal/${s.id}`} className="block rounded-xl border p-4 hover:shadow-sm">
              <div className="h-24 w-full bg-[var(--color-linen)] rounded-lg mb-3 flex items-center justify-center text-xs text-[var(--ink-subtle)]">{title}</div>
              <div className="text-xs text-[var(--ink-subtle)]">{meta}</div>
            </Link>
          </li>
        )
      })}
    </ul>
  );
}
