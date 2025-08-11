'use client'
import { useEffect, useState } from 'react'
import { Chip } from '@/components/ui'
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
  const [error,setError]=useState<string|null>(null)
  useEffect(()=>{ initAnalytics() },[])
  async function load(v:'recommended'|'softer'|'bolder'){
    if(v==='recommended') { setVariant('recommended'); setPalette(initialPalette); setTitle(initialTitle); setNarrative(initialNarrative); const sp=new URLSearchParams(window.location.search); sp.delete('v'); history.replaceState(null,'',`?${sp.toString()}`); return }
  if(loading) return
  setLoading(true); setVariant(v); setError(null)
    const sp = new URLSearchParams(window.location.search); sp.set('v', v); history.replaceState(null,'',`?${sp.toString()}`)
    try {
      const res = await fetch(`/api/stories/${storyId}/variant`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ palette: initialPalette, mode: v })
      })
      const json = await res.json().catch(()=>({}))
      if(res.status===422){
        console.warn('VARIANT_CLIENT_INVALID', json)
        setError('Invalid palette for variant')
        return
      }
      if(res.status===429){
        setError('Too many variant requests. Try again shortly.')
        return
      }
      if(!res.ok){
        setError('Variant failed')
        return
      }
      if(Array.isArray(json.variant)){
        setPalette(json.variant)
        track('variant_open',{ id: storyId, variant: v })
      } else {
        setError('Unexpected variant shape')
      }
    } finally { setLoading(false) }
  }
  return (
    <div className="mb-8 space-y-4">
      <div role="tablist" aria-label="Palette variants" className="flex gap-2 flex-wrap">
        {['recommended','softer','bolder'].map(v=> {
          const disabled = loading && variant!==v
          return <Chip key={v} role="tab" aria-selected={variant===v} aria-disabled={disabled} disabled={disabled} active={variant===v} onClick={()=>load(v as any)} className="capitalize" size="sm">{v}</Chip>
        })}
      </div>
      {loading && <div className="h-24 rounded-2xl bg-[#F2EFE9] animate-pulse flex items-center justify-center text-xs tracking-wide text-[var(--ink-subtle)]" aria-label="Loading variant">Generating…</div>}
      {error && <div role="status" className="text-xs text-red-600">{error}</div>}
    </div>
  )
}
