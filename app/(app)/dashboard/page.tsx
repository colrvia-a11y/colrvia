import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from 'next/link'
import { getIndexForUser } from '@/lib/db/stories'
import StoryHeroCard from '@/components/visual/StoryHeroCard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  // Server-side guard (middleware handles fast-path). If Supabase misconfigured treat as unauthenticated.
  let userId: string | null = null
  try {
    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect('/sign-in?next=/dashboard')
    userId = user.id
  } catch {
    return redirect('/sign-in?next=/dashboard')
  }

  let stories: any[] = [];
  try {
    if (userId) stories = await getIndexForUser(userId);
  } catch {}

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl leading-[1.05] mb-3">Your Color Stories</h1>
          <p className="text-sm text-[var(--color-fg-muted)] max-w-md">Saved palettes and variants. Open any to view placements and export.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/designers" className="btn btn-primary">New Story</Link>
          <Link href="/designers" className="btn btn-secondary">Designers</Link>
        </div>
      </header>
      <StoriesGrid stories={stories} />
  <div className="text-xs text-[var(--color-fg-muted)]">Dev: <Link href="/test-upload" className="underline">Test upload</Link></div>
    </main>
  );
}

function StoriesGrid({ stories }: { stories:any[] }) {
  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed rounded-2xl border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="w-48 h-32 rounded-2xl bg-gradient-to-br from-linen to-paper mb-8 shadow-soft" aria-hidden />
        <h2 className="font-display text-2xl mb-2">No stories yet</h2>
  <p className="text-sm text-[var(--color-fg-muted)] mb-6 max-w-xs">Start your first palette to see it appear here.</p>
  <Link href="/designers" className="btn btn-primary">Start a Color Story</Link>
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
            <StoryHeroCard imageSrc={image} title={title} meta={meta} href={`/reveal/${s.id}`} palette={s.palette} singleLineTitle />
          </li>
        )
      })}
    </ul>
  );
}