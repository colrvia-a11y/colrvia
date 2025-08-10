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
    <div className="mb-6">
      <div className="inline-flex rounded-full border bg-white overflow-hidden text-sm">
        {['recommended','softer','bolder'].map(v=> (
          <button key={v} onClick={()=>load(v as any)} className={`px-4 py-1.5 capitalize focus:outline-none ${variant===v?'bg-neutral-900 text-white':'hover:bg-neutral-100'}`}>{v}</button>
        ))}
      </div>
      {loading && <div className="mt-4 h-24 rounded-xl bg-neutral-100 animate-pulse" aria-label="Loading variant" />}
    </div>
  )
}
