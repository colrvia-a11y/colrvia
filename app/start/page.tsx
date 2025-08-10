"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import { Upload } from '@/components/upload'
import { useReducedMotion } from '@/components/theme/MotionSettings'

export const dynamic = 'force-dynamic'

// Simplified flow: vibe, brand, photo. Hidden defaults for other required fields.
const Schema = z.object({
  designer: z.enum(['Emily','Zane','Marisol']).default('Emily'),
  vibe: z.enum(['Cozy Neutral','Airy Coastal','Earthy Organic','Modern Warm','Soft Pastels','Moody Blue-Green']),
  brand: z.enum(['SW','Behr']),
  lighting: z.enum(['day','evening','mixed']).default('day'),
  hasWarmWood: z.boolean().default(false),
  roomType: z.string().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  title: z.string().max(120).optional().nullable()
})
type FormData = z.infer<typeof Schema>

const VIBES = ['Cozy Neutral','Airy Coastal','Earthy Organic','Modern Warm','Soft Pastels','Moody Blue-Green'] as const

function StartInner(){
  const router = useRouter()
  const reduced = useReducedMotion()
  const [mixing,setMixing]=useState(false)
  const { handleSubmit, setValue, watch, formState:{ isSubmitting } } = useForm<FormData>({
    resolver:zodResolver(Schema),
    mode:'onChange',
    defaultValues:{ designer:'Emily', vibe:'Cozy Neutral', brand:'SW', lighting:'day', hasWarmWood:false }
  })
  const values = watch()
  function normalizeBrandForPost(b:string){
    const s = b.trim().toLowerCase()
    if(['sherwin-williams','sherwin_williams','sw','sherwin'].includes(s)) return 'sherwin_williams'
    if(['behr','behr®','behr paint'].includes(s)) return 'behr'
    return s
  }
  async function submit(values:FormData){
    setMixing(true)
    try {
      const body: any = {
        brand: normalizeBrandForPost(values.brand),
        designerKey: (values.designer || 'Marisol').toLowerCase(),
        vibe: values.vibe || undefined,
        lighting: (values.lighting === 'day' ? 'daylight' : values.lighting) || undefined,
        room: values.roomType || undefined
      } as const
      if(values.title){
        body.title = values.title.trim().slice(0,120)
      }
      const res = await fetch('/api/stories',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      let payload: any = null
      try { payload = await res.json() } catch {}
      if(res.status===401){
        alert('Please sign in to create a Color Story.')
        setMixing(false)
        router.push('/sign-in')
        return
      }
      if(res.status===402){
        const msg = payload?.message || 'Free limit reached — upgrade to save more stories'
        alert(msg)
        setMixing(false)
        return
      }
      if(res.status===422){
        const issues = payload?.issues ? payload.issues.map((i:any)=> `${i.path}: ${i.message}`).join('\n') : ''
        alert(issues || 'Invalid input')
        setMixing(false)
        return
      }
      if(!res.ok){
        const code = payload?.error || payload?.code || 'SERVER_ERROR'
        alert(`Error generating story (${code}). ${payload?.detail || ''}`)
        setMixing(false)
        return
      }
      router.push('/reveal/'+payload.id)
    } catch(e){ console.error(e); alert('Unexpected error.'); setMixing(false) }
  }
  return (
    <form onSubmit={handleSubmit(submit)} className="pb-36 md:pb-10">
      <h1 className="font-display text-4xl leading-[1.05] px-4 pt-10 mb-8">Create your color story</h1>
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        <section className="rounded-2xl border border-linen bg-surface p-6 shadow-soft space-y-5" aria-labelledby="vibe-heading">
          <div>
            <h2 id="vibe-heading" className="font-display text-2xl mb-1">Vibe</h2>
            <p className="text-sm text-[var(--ink-subtle)]">Choose the feeling you want your space to evoke.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {VIBES.map(v=> <Chip key={v} active={values.vibe===v} onClick={()=>setValue('vibe', v,{shouldValidate:true})} className="text-sm px-5 py-2">{v}</Chip> )}
          </div>
        </section>
        <section className="rounded-2xl border border-linen bg-surface p-6 shadow-soft space-y-5" aria-labelledby="brand-heading">
          <div>
            <h2 id="brand-heading" className="font-display text-2xl mb-1">Brand</h2>
            <p className="text-sm text-[var(--ink-subtle)]">Select your preferred paint catalog (more coming soon).</p>
          </div>
          <div className="flex gap-3">
            {['SW','Behr'].map(b=> <Chip key={b} active={values.brand===b} onClick={()=>setValue('brand', b as any,{shouldValidate:true})} className="text-sm px-5 py-2">{b}</Chip> )}
          </div>
        </section>
        <section className="rounded-2xl border border-linen bg-surface p-6 shadow-soft space-y-5" aria-labelledby="photo-heading">
          <div>
            <h2 id="photo-heading" className="font-display text-2xl mb-1">Photo (optional)</h2>
            <p className="text-sm text-[var(--ink-subtle)]">Add a reference photo to guide undertones.</p>
          </div>
          <Upload onUploaded={(u)=> setValue('photoUrl', u,{shouldValidate:true})} />
          {values.photoUrl && <div className="text-xs text-[var(--ink-subtle)]">Photo attached.</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Room type (optional)</label>
            <input name="roomType" onChange={e=>setValue('roomType', e.target.value)} placeholder="Living room, Bedroom…" className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Story title (optional)</label>
            <input name="title" maxLength={120} onChange={e=>setValue('title', e.target.value,{shouldValidate:true})} placeholder="E.g. Cozy Neutral Retreat" className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm" />
          </div>
        </section>
      </div>
      <div className="fixed md:static bottom-0 inset-x-0 md:mt-8 bg-[var(--bg-canvas)]/90 backdrop-blur border-t border-[var(--border)] md:border-0 p-4 md:p-0">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3 text-[13px] text-[var(--ink-subtle)] md:flex-1 md:order-1 order-2">
            {mixing && <MixingIndicator reduced={reduced} />}
            <span className="hidden md:inline">Colrvia crafts harmonious placements from your vibe & brand.</span>
          </div>
          <Button disabled={mixing || !values.brand} variant="primary" className="flex-1 md:flex-none" type="submit">{mixing? 'Mixing paints…' : 'Get My Palette'}</Button>
        </div>
      </div>
    </form>
  )
}

function MixingIndicator({ reduced }: { reduced:boolean }){
  return (
    <div className="flex items-center gap-1.5" aria-label="Mixing paints" role="status">
      {[0,1,2].map(i=> <span key={i} className="h-2.5 w-2.5 rounded-full bg-brand/70" style={!reduced?{ animation:`blob 1.2s ${i*0.15}s infinite ease-in-out`}:undefined} />)}
      <span className="sr-only">Generating palette</span>
    </div>
  )
}

export default function StartPage(){
  return <StartInner />
}
