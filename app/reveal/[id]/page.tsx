import { supabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import VariantTabs from './variant-tabs'
import { Metadata } from 'next'
import RevealClient from './reveal-client'
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
        <p className="text-neutral-600 text-sm">This is a placeholder. Generate a real story from Start.</p>
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
      <section className="flex gap-4 text-xs font-medium">
        <div className="flex-1 h-3 rounded-full bg-neutral-200 overflow-hidden"><div className="h-full bg-neutral-900" style={{width: placements.sixty+'%'}} /></div>
        <div className="flex-1 h-3 rounded-full bg-neutral-200 overflow-hidden"><div className="h-full bg-neutral-600" style={{width: placements.thirty+'%'}} /></div>
        <div className="flex-1 h-3 rounded-full bg-neutral-200 overflow-hidden"><div className="h-full bg-neutral-400" style={{width: placements.ten+'%'}} /></div>
      </section>
  <VariantTabs storyId={data.id} initialPalette={palette} initialTitle={data.title} initialNarrative={data.narrative} baseMeta={{ brand:data.brand, vibe:data.vibe }} />
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="palette-grid">
        {palette.map((p,i)=> (
          <div key={i} className="rounded-2xl border overflow-hidden group">
            <div className="h-24" style={{background:p.hex}} />
            <div className="p-3 text-sm">
              <div className="font-medium">{p.name}</div>
              <div className="text-neutral-600 text-xs">{p.code} · {p.brand}</div>
              <div className="text-neutral-500 mt-1 text-xs">{p.role}</div>
            </div>
          </div>
        ))}
      </section>
      <section className="prose prose-sm max-w-none text-neutral-800"><p>{data.narrative}</p></section>
      <div className="flex gap-3 pt-4 flex-wrap">
        <button onClick={()=>{
          const lines = palette.map(p=>`${p.name} — ${p.code} (${p.hex})`).join('\n');
          navigator.clipboard.writeText(lines)
        }} className="btn btn-primary">Copy codes</button>
        <button onClick={()=>{ const v = new URLSearchParams(window.location.search).get('v'); window.open(`/api/share/${id}/image${v?`?variant=${v}`:''}`,'_blank'); }} className="btn btn-secondary">Share Image</button>
      </div>
    </main>
  )
}
