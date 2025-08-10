'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export const dynamic = 'force-dynamic'

// Interim schema (will evolve to vibe, brand, lighting, warm wood, etc.)
const Schema = z.object({
  designer: z.enum(['Emily','Zane','Marisol']).default('Emily'),
  vibe: z.enum(['Cozy Neutral','Airy Coastal','Earthy Organic','Modern Warm','Soft Pastels','Moody Blue-Green']),
  brand: z.enum(['SW','Behr']),
  lighting: z.enum(['day','evening','mixed']),
  hasWarmWood: z.boolean().default(false),
  roomType: z.string().optional().nullable(),
  photoUrl: z.string().url().optional().nullable()
})
type FormData = z.infer<typeof Schema>

function StepperInner() {
  const sp = useSearchParams()
  const router = useRouter()
  const designer = (sp.get('designer') ?? 'emily') as 'emily'|'zane'|'marisol'
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, trigger, formState: { errors }, setValue, watch } = useForm<FormData>({ resolver: zodResolver(Schema), mode: 'onChange', defaultValues:{ designer: designer==='emily'?'Emily': designer==='zane'?'Zane':'Marisol' } as any })

  const total = 3
  const pct = Math.round((step/total)*100)

  async function next() {
    // simple step validation for now
    const ok = await trigger()
    if (!ok) return
    if (step < total) setStep(s => s+1)
  }

  async function onSubmit(values: FormData) {
    setBusy(true)
    try {
      const res = await fetch('/api/stories', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(values) })
      if (res.status === 402) {
        alert('Free limit reached — upgrade to save more stories')
        setBusy(false)
        return
      }
      if (!res.ok) {
        console.error('START_SUBMIT_FAILED', await res.text())
        alert('Error generating story. Ensure stories table exists (run /db/supabase.sql).')
        setBusy(false)
        return
      }
      const json = await res.json()
      router.push('/reveal/' + json.id)
    } catch (e) {
      console.error('START_SUBMIT_ERR', e)
      alert('Unexpected error.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden mb-8"><div className="h-full bg-black transition-all" style={{ width: pct+'%' }} /></div>
      <h1 className="text-2xl font-semibold mb-2">Quick interview</h1>
      <p className="text-neutral-600 mb-6">Step {step} of {total}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step===1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm mb-1">Vibe</label>
              <select {...register('vibe')} className="w-full border rounded-xl px-3 py-2">
                <option>Cozy Neutral</option>
                <option>Airy Coastal</option>
                <option>Earthy Organic</option>
                <option>Modern Warm</option>
                <option>Soft Pastels</option>
                <option>Moody Blue-Green</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Brand</label>
              <select {...register('brand')} className="w-full border rounded-xl px-3 py-2">
                <option>SW</option>
                <option>Behr</option>
              </select>
            </div>
          </div>
        )}
        {step===2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm mb-1">Lighting</label>
              <select {...register('lighting')} className="w-full border rounded-xl px-3 py-2">
                <option value="day">Day</option>
                <option value="evening">Evening</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="warmwood" type="checkbox" {...register('hasWarmWood')} className="rounded" />
              <label htmlFor="warmwood" className="text-sm">Warm wood present</label>
            </div>
          </div>
        )}
        {step===3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm mb-1">Room Type (optional)</label>
              <input {...register('roomType')} className="w-full border rounded-xl px-3 py-2" placeholder="Living Room, Bedroom..." />
            </div>
            <div className="text-sm text-neutral-600 bg-neutral-50 border rounded-xl p-3">Review then generate.</div>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          {step < total && <button type="button" onClick={next} className="btn btn-primary flex-1">Next</button>}
          {step === total && <button disabled={busy} className="btn btn-primary flex-1">{busy?'Working…':'Generate'}</button>}
          {step>1 && <button type="button" onClick={()=>setStep(s=>s-1)} className="btn btn-secondary">Back</button>}
        </div>
      </form>
    </main>
  )
}

function StartWrapper(){
  return <StepperInner />
}

export default function StartPage(){
  return (
    <Suspense fallback={<main className="mx-auto max-w-xl p-6"><p className="text-neutral-600">Loading…</p></main>}>
      <StartWrapper />
    </Suspense>
  )
}
