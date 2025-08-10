import { supabaseServer } from '@/lib/supabase/server'
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
export async function generateMetadata({ params, searchParams }:{ params:{id:string}; searchParams:Record<string,string|undefined> }): Promise<Metadata> {
  const id = params.id
  const v = searchParams?.v
  return {
    openGraph: {
      images: [`/api/share/${id}/image${v?`?variant=${v}`:''}`]
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/api/share/${id}/image${v?`?variant=${v}`:''}`]
    }
  }
}

export const dynamic = 'force-dynamic'

export default async function RevealStoryPage({ params }:{ params:{ id:string }}) {
  const id = params.id
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
  const { data, error } = await supabase.from('stories').select('*').eq('id', id).single()
  if (error || !data) return <main className="mx-auto max-w-xl p-6"><p className="text-neutral-600">Story not found.</p></main>
  const placements = data.placements?.pct || { sixty:60, thirty:30, ten:10 }
  const palette = (data.palette||[]) as any[]
  const heroImage = data.photo_url || '/icons/icon-192.png'
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-10">
      <div className="rounded-2xl overflow-hidden relative">
        <StoryHeroCard imageSrc={heroImage} title={data.title} meta={`${data.brand} · ${data.vibe}`} href="#palette" palette={palette} ctaLabel="Open" />
        <div className="absolute bottom-4 right-4"><PdfButton storyId={data.id} /></div>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-[var(--ink-subtle)]">
        <span>{new Date(data.created_at).toLocaleDateString()}</span>
        <span aria-hidden>•</span>
        <RevealClient story={{ id:data.id, title:data.title, narrative:data.narrative, palette, placements:data.placements }} />
      </div>
      <div className="space-y-4" aria-label="Placement ratios">
        <div className="flex gap-3 text-[10px] tracking-wide uppercase text-[var(--ink-subtle)]">
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
      <SwatchRibbon swatches={palette.slice(0,5).map(p=>({ hex:p.hex, name:p.name }))} />
      <section className="relative" id="palette">
        <PaletteGrid palette={palette as any} onCopy={(c)=>{ if(typeof window!=='undefined'){ window.dispatchEvent(new CustomEvent('swatch-copied',{ detail:{ hex:c.hex, name:c.name } })) } }} />
        <CopyToast />
      </section>
      <section className="prose prose-sm max-w-none text-neutral-800" aria-label="Narrative description"><p>{data.narrative}</p></section>
      <StoryActionBar storyId={data.id} palette={palette as any} />
    </main>
  )
}
