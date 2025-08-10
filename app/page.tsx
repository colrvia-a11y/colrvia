import Link from 'next/link'
import Button from '@/components/ui/Button'
import HorizontalCarousel from '@/components/visual/HorizontalCarousel'
import StoryHeroCard from '@/components/visual/StoryHeroCard'
import { supabaseServer } from '@/lib/supabase/server'
import { getIndexForUser } from '@/lib/db/stories'

export const dynamic = 'force-dynamic'

export default async function Home(){
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  let stories:any[] = []
  if(user){ try { stories = await getIndexForUser(user.id) } catch {} }
  const recents = stories.slice(0,8)
  return (
    <div className="space-y-20 pb-24">
      <section className="pt-20 px-4 max-w-6xl mx-auto">
        <div className="max-w-2xl space-y-8">
          <div className="inline-block text-[11px] tracking-[0.25em] font-medium text-[var(--ink-subtle)]">COLOR STORY DESIGN</div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight">Design your color story.</h1>
          <p className="text-lg text-[var(--ink-subtle)] max-w-md">Large, legible palettes. Real paint codes. Placement clarity you can trust.</p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button as={Link} href="/start" variant="primary">Start a Color Story</Button>
            <Button as={Link} href="#your-stories" variant="secondary">Your Stories</Button>
          </div>
          <div className="relative w-full max-w-sm pt-4">
            <input type="search" placeholder="Search saved stories" className="w-full rounded-xl border border-linen bg-surface px-4 py-3 text-sm shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40" aria-label="Search stories" />
          </div>
        </div>
      </section>
      <section className="px-4 max-w-6xl mx-auto space-y-6" aria-labelledby="rec-heading">
        <div className="flex items-end justify-between">
          <h2 id="rec-heading" className="font-display text-2xl">Recommendations</h2>
          {user && recents.length>0 && <Link href="/dashboard" className="text-sm underline">View all</Link>}
        </div>
        {recents.length===0 ? (
          <div className="text-sm text-[var(--ink-subtle)]">Sign in and create a story to see recommendations.</div>
        ) : (
          <HorizontalCarousel>
            {recents.map(s=>{
              const image = s.photoUrl || '/icons/icon-192.png'
              return <div key={s.id} className="snap-start shrink-0 w-[260px]"><StoryHeroCard imageSrc={image} title={s.title} meta={`${s.vibe} · ${s.brand}`} href={`/reveal/${s.id}`} palette={s.palette} /></div>
            })}
          </HorizontalCarousel>
        )}
      </section>
      <section id="your-stories" className="px-4 max-w-6xl mx-auto space-y-6">
        <h2 className="font-display text-2xl">Your Stories</h2>
        {stories.length===0 ? <p className="text-sm text-[var(--ink-subtle)]">None yet — start one above.</p> : (
          <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {stories.map(s=>{
              const image = s.photoUrl || '/icons/icon-192.png'
              return <li key={s.id} className="[&>div]:h-full"><StoryHeroCard imageSrc={image} title={s.title} meta={`${s.vibe} · ${s.brand}`} href={`/reveal/${s.id}`} palette={s.palette} /></li>
            })}
          </ul>
        )}
      </section>
    </div>
  )
}