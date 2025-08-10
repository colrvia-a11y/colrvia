'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Progress from '@/components/ui/Progress'
import FadeIn from '@/components/motion/FadeIn'
import DesignerCard from '@/components/start/DesignerCard'
import SummaryCard from '@/components/start/SummaryCard'
import { Upload } from '@/components/upload'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  designer: z.enum(['Emily','Zane','Marisol']),
  vibe: z.enum(['Cozy Neutral','Airy Coastal','Earthy Organic','Modern Warm','Soft Pastels','Moody Blue-Green']),
  brand: z.enum(['SW','Behr']),
  lighting: z.enum(['day','evening','mixed']),
  hasWarmWood: z.boolean(),
  roomType: z.string().optional().nullable(),
  photoUrl: z.string().url().optional().nullable()
})
type FormData = z.infer<typeof Schema>

const DESIGNERS: { id:'emily'|'zane'|'marisol'; name:string; headline:string; blurb:string; palette:string[] }[] = [
  { id:'emily', name:'Emily', headline:'Tonal calm', blurb:'Low-contrast, airy balance for serene spaces.', palette:['#EDEAE4','#D2D0CB','#ADB5B2','#6F8F86','#2F5D50'] },
  { id:'zane', name:'Zane', headline:'Bold energy', blurb:'Sculpted contrast and saturated accents.', palette:['#F7BE58','#C07A5A','#2F5D50','#203A35','#111312'] },
  { id:'marisol', name:'Marisol', headline:'Earthy warmth', blurb:'Grounded neutrals with sun-soft accents.', palette:['#F0E8DE','#D9C8B8','#C07A5A','#8A5232','#2F5D50'] },
]

const VIBES = ['Cozy Neutral','Airy Coastal','Earthy Organic','Modern Warm','Soft Pastels','Moody Blue-Green'] as const

import { Suspense } from 'react'

function StartInner(){
  const sp = useSearchParams()
  const seedDesigner = (sp.get('designer') ?? 'emily') as 'emily'|'zane'|'marisol'
  const router = useRouter()
  const [step,setStep]=useState(1)
  const total=3
  const { register, handleSubmit, setValue, watch, trigger, formState:{ isValid, isSubmitting } } = useForm<FormData>({
    resolver:zodResolver(Schema),
    mode:'onChange',
    defaultValues:{ designer: seedDesigner==='emily'?'Emily':seedDesigner==='zane'?'Zane':'Marisol', vibe:'Cozy Neutral', brand:'SW', lighting:'day', hasWarmWood:false }
  })
  const values = watch()
  const pct = Math.round((step/total)*100)

  async function submit(values:FormData){
    try {
      const res = await fetch('/api/stories',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(values) })
      if(res.status===402){ alert('Free limit reached — upgrade to save more stories'); return }
      if(!res.ok){ alert('Error generating story.'); return }
      const json = await res.json(); router.push('/reveal/'+json.id)
    } catch(e){ console.error(e); alert('Unexpected error.') }
  }

  function next(){ if(step<total) setStep(s=>s+1) }
  function back(){ if(step>1) setStep(s=>s-1) }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
  <Progress value={step} max={total} />
  <h1 className="font-display text-4xl leading-[1.05]">Create your color story</h1>
      <form onSubmit={handleSubmit(submit)} className="space-y-12">
        {step===1 && (
          <FadeIn as='section' className="space-y-6" aria-labelledby="designer-heading">
            <div>
              <h2 id="designer-heading" className="font-display text-2xl mb-1">Choose a designer lens</h2>
              <p className="text-sm text-[var(--ink-subtle)]">Each brings a different balance of contrast, warmth, and saturation.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {DESIGNERS.map(d=> <DesignerCard key={d.id} designer={d} active={values.designer===d.name} onSelect={()=>setValue('designer', d.name as any,{shouldValidate:true})} /> )}
            </div>
          </FadeIn>
        )}
        {step===2 && (
          <FadeIn as='section' className="space-y-8" aria-labelledby="space-heading">
            <div>
              <h2 id="space-heading" className="font-display text-2xl mb-1">Describe your space</h2>
              <p className="text-sm text-[var(--ink-subtle)]">A few quick choices help tailor undertones and contrast.</p>
            </div>
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-medium mb-2">Vibe</h3>
                <div className="flex flex-wrap gap-2">
                  {VIBES.map(v=> <Chip key={v} active={values.vibe===v} onClick={()=>setValue('vibe', v,{shouldValidate:true})}>{v}</Chip> )}
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">Paint brand</legend>
                  <div className="flex gap-2">
                    {['SW','Behr'].map(b=> <Chip key={b} active={values.brand===b} onClick={()=>setValue('brand', b as any,{shouldValidate:true})}>{b}</Chip> )}
                  </div>
                </fieldset>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">Typical lighting</legend>
                  <div className="flex gap-2">
                    {['day','evening','mixed'].map(l=> <Chip key={l} active={values.lighting===l} onClick={()=>setValue('lighting', l as any,{shouldValidate:true})} className="capitalize">{l}</Chip> )}
                  </div>
                </fieldset>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">Warm wood present?</legend>
                  <div className="flex gap-2">
                    {[true,false].map(val=> <Chip key={String(val)} active={values.hasWarmWood===val} onClick={()=>setValue('hasWarmWood', val,{shouldValidate:true})}>{val? 'Yes':'No'}</Chip> )}
                  </div>
                </fieldset>
              </div>
            </div>
          </FadeIn>
        )}
        {step===3 && (
          <FadeIn as='section' className="space-y-10" aria-labelledby="photo-heading">
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1 space-y-6">
                <div>
                  <h2 id="photo-heading" className="font-display text-2xl mb-1">Photo & summary</h2>
                  <p className="text-sm text-[var(--ink-subtle)]">Optional reference photo further anchors undertones.</p>
                </div>
                <Upload onUploaded={(u)=> setValue('photoUrl', u,{shouldValidate:true})} />
                {values.photoUrl && (
                  <div className="text-xs text-[var(--ink-subtle)]">Photo attached.</div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Room type (optional)</label>
                  <input {...register('roomType')} placeholder="Living room, Bedroom…" className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm" />
                </div>
              </div>
              <SummaryCard values={values} />
            </div>
          </FadeIn>
        )}
        <div className="flex gap-3 pt-2">
          {step<total && <Button type="button" onClick={next} variant="primary" className="flex-1">Continue</Button>}
          {step===total && <Button disabled={isSubmitting || !values.designer || !values.vibe} className="flex-1" variant="primary">{isSubmitting? 'Generating…':'Generate palette'}</Button>}
          {step>1 && <Button type="button" onClick={back} variant="secondary">Previous</Button>}
        </div>
      </form>
    </main>
  )
}

export default function StartPage(){
  return (
    <Suspense fallback={<main className="max-w-3xl mx-auto px-4 py-10"><div className="animate-pulse h-6 w-40 bg-[var(--bg-mute)] rounded" /></main>}>
      <StartInner />
    </Suspense>
  )
}
