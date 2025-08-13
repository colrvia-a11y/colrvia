import { supabaseServer } from '@/lib/supabase/server'
export const runtime = 'nodejs'
import Link from 'next/link'
import VariantTabs from './variant-tabs'
import { Metadata } from 'next'
import StoryActionBar from '@/components/reveal/StoryActionBar'
import RevealClient from './reveal-client'
import PaletteGrid from '@/components/reveal/PaletteGrid'
import CopyToast from '@/components/reveal/CopyToast'
import StoryHeroCard from '@/components/visual/StoryHeroCard'
import SwatchRibbon from '@/components/visual/SwatchRibbon'
import PdfButton from './pdf-button'
import RevealPoller from '@/components/reveal/RevealPoller'
import { normalizePalette } from '@/lib/palette'
import { repairStoryPalette } from '@/lib/palette/repair'
import RevealPaletteClient from './RevealPaletteClient'
import NextDynamic from 'next/dynamic'
const NarrativeCard = NextDynamic(() => import('@/components/reveal/NarrativeCard'), { ssr:false })
export async function generateMetadata({ params, searchParams }:{ params:{id:string}; searchParams:Record<string,string|undefined> }): Promise<Metadata> {
  const id = params.id
  const v = searchParams?.v
  // Try fetching title + vibe for a richer page title; fall back silently if unauth.
  let title: string | undefined
  try {
    const supabase = supabaseServer()
    const { data } = await supabase.from('stories').select('title').eq('id', id).single()
    if (data?.title) title = data.title
  } catch {}
  const displayTitle = title || 'Color Story'
  return {
    title: displayTitle,
    openGraph: {
      title: displayTitle,
      images: [`/api/share/${id}/image${v?`?variant=${v}`:''}`]
    },
    twitter: {
      title: displayTitle,
      card: 'summary_large_image',
      images: [`/api/share/${id}/image${v?`?variant=${v}`:''}`]
    }
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RevealStoryPage({ params, searchParams }:{ params:{ id:string }, searchParams:{ optimistic?:string }}) {
  const id = params.id
  const optimistic = searchParams?.optimistic === "1" || id.startsWith("tmp_")
  if (optimistic) {
    return (
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
        {/* ensure we auto-finish when it's a real id */}
        {!id.startsWith("tmp_") && <RevealPoller id={id} />}
        <h1 className="text-xl font-semibold mb-4">Generating your designs…</h1>
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_,i) => (
            <div key={i} className="rounded-xl border p-3">
              <div className="aspect-video rounded-lg bg-neutral-200 animate-pulse mb-2" />
              <div className="h-3 w-2/3 rounded bg-neutral-200 animate-pulse" />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-neutral-500">This takes about 8–15 seconds. You can keep browsing.</p>
      </div>
    )
  }
  if (id === 'mock') {
    return (
      <main className="mx-auto max-w-3xl p-6 space-y-6">
        <h1 className="text-3xl font-semibold">Mock Story</h1>
        <p className="text-neutral-600 text-sm">Placeholder story. Create a real one from the start flow.</p>
      </main>
    )
  }
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <main className="mx-auto max-w-xl p-6"><p className="mb-4">Sign in to view this story.</p><Link href="/sign-in" className="btn btn-primary">Sign in</Link></main>
  let { data, error } = await supabase.from('stories').select('*').eq('id', id).single()
  if (error || !data) return <main className="mx-auto max-w-xl p-6"><p className="text-neutral-600">Story not found.</p></main>
  let palette: any[] = []
  let valid = false
  try {
    palette = normalizePalette(data.palette, data.brand as any)
    valid = Array.isArray(palette) && palette.length===5
  } catch {
    valid = false
  }
  if(!valid){
    await repairStoryPalette({ id })
    const again = await supabase.from('stories').select('*').eq('id', id).single()
    if(!again.error && again.data){
      data = again.data
      try { palette = normalizePalette(data.palette, data.brand as any); valid = Array.isArray(palette) && palette.length===5 } catch { valid=false }
    }
  }
  if(!valid){
    console.error('REVEAL_FINAL_REPAIR_FAIL', { id })
  }
  const placements = (data.placements && typeof data.placements === 'object' ? (data.placements as any).pct : undefined) || { sixty:60, thirty:30, ten:10 }
  const heroImage = data.photo_url || '/icons/icon-192.png'
  const displayTitle = data.title || 'Your Color Story'
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-10">
      <div className="rounded-2xl overflow-hidden relative" aria-label={displayTitle}>
  <StoryHeroCard imageSrc={heroImage} title={displayTitle} meta={`${data.brand} · ${data.vibe}`} href="#palette" palette={palette.filter(p=>p.hex).map(p=>({ hex:p.hex!, name:p.name }))} ctaLabel="Open" />
        <div className="absolute bottom-4 right-4"><PdfButton storyId={data.id} /></div>
      </div>
  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>{new Date(data.created_at).toLocaleDateString()}</span>
        <span aria-hidden>•</span>
  <RevealClient story={{ id:data.id, title:displayTitle, narrative:data.narrative, palette, placements:data.placements }} />
      </div>
      <div className="space-y-4" aria-label="Placement ratios">
  <div className="flex gap-3 text-[10px] tracking-wide uppercase text-muted-foreground">
          <span className="flex-1">Primary</span>
          <span className="flex-1">Secondary</span>
          <span className="flex-1">Accent</span>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex-1 h-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden"><div className="h-full bg-[var(--brand)]" style={{width:placements.sixty+'%'}} /></div>
          <div className="flex-1 h-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden"><div className="h-full bg-accent/80" style={{width:placements.thirty+'%'}} /></div>
          <div className="flex-1 h-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden"><div className="h-full bg-accent/40" style={{width:placements.ten+'%'}} /></div>
        </div>
      </div>
      <VariantTabs storyId={data.id} initialPalette={palette} initialTitle={data.title} initialNarrative={data.narrative} baseMeta={{ brand:data.brand, vibe:data.vibe }} />
      {palette.length>0 ? (
        <>
          <SwatchRibbon swatches={palette.slice(0,5).filter(p=>p.hex).map(p=>({ hex:p.hex!, name:p.name }))} />
          <section className="relative" id="palette">
            <RevealPaletteClient palette={palette as any} />
            <CopyToast />
          </section>
          <div className="mt-6">
            <NarrativeCard storyId={data.id} />
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center space-y-4 bg-[var(--bg-surface)]">
          <h2 className="font-display text-xl">No palette yet</h2>
          <p className="text-sm text-muted-foreground">We couldn&apos;t parse a palette for this story. Try generating again or start a new one.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/start?regenerate=${id}`} className="btn btn-primary">Regenerate</Link>
            <Link href="/designers" className="btn btn-secondary">New Story</Link>
          </div>
        </div>
      )}
      <StoryActionBar storyId={data.id} palette={palette as any} />
    </main>
  )
}
