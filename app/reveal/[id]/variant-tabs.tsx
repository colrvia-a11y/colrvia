'use client'
import { useEffect, useState } from 'react'
import Chip from '@/components/ui/Chip'
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
      <div role="tablist" aria-label="Palette variants" className="flex gap-2 flex-wrap">
        {['recommended','softer','bolder'].map(v=> (
          <Chip key={v} role="tab" aria-selected={variant===v} active={variant===v} onClick={()=>load(v as any)} className="capitalize" size="sm">{v}</Chip>
        ))}
      </div>
      {loading && <div className="h-24 rounded-2xl bg-[#F2EFE9] animate-pulse" aria-label="Loading variant" />}
    </div>
  )
}
