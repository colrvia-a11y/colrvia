import { supabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import VariantTabs from './variant-tabs'
import { Metadata } from 'next'
import { initAnalytics, track } from '@/lib/analytics'
import StoryActionBar from '@/components/reveal/StoryActionBar'
import RevealClient from './reveal-client'
import SwatchCard from '@/components/reveal/SwatchCard'
import PaletteGrid from '@/components/reveal/PaletteGrid'
import CopyToast from '@/components/reveal/CopyToast'
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
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-10">
      <header>
        <div className="eyebrow mb-3">COLRVIA</div>
        <div className="flex items-center gap-4 mb-2 flex-wrap">
          <h1 className="text-3xl font-semibold">{data.title}</h1>
          <RevealClient story={{ id:data.id, title:data.title, narrative:data.narrative, palette, placements:data.placements }} />
        </div>
        <p className="text-neutral-500 text-sm">{new Date(data.created_at).toLocaleString()} · {data.brand} · {data.vibe}</p>
      </header>
      <section className="flex flex-col gap-2" aria-label="Placement ratios">
        <div className="flex gap-3 text-[10px] tracking-wide uppercase text-[var(--ink-subtle)]">
          <span className="flex-1">Primary</span>
          <span className="flex-1">Secondary</span>
          <span className="flex-1">Accent</span>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <div className="group relative flex-1 h-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
            <div className="h-full bg-[var(--brand)] transition-all" style={{width: placements.sixty+'%'}} />
            <span className="sr-only">Primary {placements.sixty}%</span>
          </div>
          <div className="group relative flex-1 h-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
            <div className="h-full bg-[var(--accent)]/80 transition-all" style={{width: placements.thirty+'%'}} />
            <span className="sr-only">Secondary {placements.thirty}%</span>
          </div>
          <div className="group relative flex-1 h-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden">
            <div className="h-full bg-[var(--accent)]/40 transition-all" style={{width: placements.ten+'%'}} />
            <span className="sr-only">Accent {placements.ten}%</span>
          </div>
        </div>
      </section>
  <VariantTabs storyId={data.id} initialPalette={palette} initialTitle={data.title} initialNarrative={data.narrative} baseMeta={{ brand:data.brand, vibe:data.vibe }} />
  <section className="relative" id="palette-grid">
  <PaletteGrid palette={palette as any} onCopy={(c)=>{ if(typeof window!=='undefined'){ window.dispatchEvent(new CustomEvent('swatch-copied',{ detail:{ hex:c.hex, name:c.name } })) } }} />
    <CopyToast />
  </section>
      <section className="prose prose-sm max-w-none text-neutral-800" aria-label="Narrative description"><p>{data.narrative}</p></section>
  <StoryActionBar storyId={data.id} palette={palette as any} />
    </main>
  )
}
