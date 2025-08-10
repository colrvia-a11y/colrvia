'use client'
import { useEffect, useState } from 'react'
import { track, initAnalytics } from '@/lib/analytics'

interface Props { storyId:string; initialPalette:any[]; initialTitle:string; initialNarrative:string; baseMeta:{brand:string; vibe:string} }
export default function VariantTabs({ storyId, initialPalette, initialTitle, initialNarrative }: Props){
  const [variant, setVariant] = useState<'recommended'|'softer'|'bolder'>(()=>{
    if(typeof window !== 'undefined'){
      const v = new URLSearchParams(window.location.search).get('v')
      if(v==='softer' || v==='bolder') return v
    }
    return 'recommended'
  })
  const [loading,setLoading]=useState(false)
  const [palette,setPalette]=useState(initialPalette)
  const [title,setTitle]=useState(initialTitle)
  const [narrative,setNarrative]=useState(initialNarrative)
  useEffect(()=>{ initAnalytics() },[])
  async function load(v:'recommended'|'softer'|'bolder'){
    if(v==='recommended') { setVariant('recommended'); setPalette(initialPalette); setTitle(initialTitle); setNarrative(initialNarrative); const sp=new URLSearchParams(window.location.search); sp.delete('v'); history.replaceState(null,'',`?${sp.toString()}`); return }
    setLoading(true); setVariant(v)
    const sp = new URLSearchParams(window.location.search); sp.set('v', v); history.replaceState(null,'',`?${sp.toString()}`)
    try {
      const res = await fetch(`/api/stories/${storyId}/variant?type=${v}`)
      const json = await res.json()
      if(res.ok){
        setPalette(json.palette)
        setTitle(json.title)
        setNarrative(json.narrative)
        track('variant_open',{ id: storyId, variant: v })
      }
    } finally { setLoading(false) }
  }
  return (
    <div className="mb-8 space-y-4">
      <div role="tablist" aria-label="Palette variants" className="inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden text-sm">
        {['recommended','softer','bolder'].map(v=> {
          const active = variant===v
          return (
            <button
              key={v}
              role="tab"
              aria-selected={active}
              onClick={()=>load(v as any)}
              className={`px-5 py-2 capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] transition-colors ${active? 'bg-[var(--brand)] text-white':'hover:bg-[#F2EFE9] text-[var(--ink)]'}`}
            >{v}</button>
          )
        })}
      </div>
      {loading && <div className="h-24 rounded-2xl bg-[#F2EFE9] animate-pulse" aria-label="Loading variant" />}
    </div>
  )
}
