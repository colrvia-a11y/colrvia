'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export const dynamic = 'force-dynamic'

const Step1 = z.object({ lighting: z.string().min(2), mood: z.string().min(2) })
const Step2 = z.object({ style: z.string().min(2), floor: z.string().min(1) })
const Step3 = z.object({ accent: z.string().min(2) })
const All = Step1.merge(Step2).merge(Step3)
type FormData = z.infer<typeof All>

function StepperInner() {
  const sp = useSearchParams()
  const router = useRouter()
  const designer = (sp.get('designer') ?? 'emily') as 'emily'|'zane'|'marisol'
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, trigger, formState: { errors, isValid }, getValues } = useForm<FormData>({ resolver: zodResolver(All), mode: 'onChange' })

  const total = 3
  const pct = Math.round((step/total)*100)

  async function next() {
    const fields = step===1 ? ['lighting','mood'] : step===2 ? ['style','floor'] : ['accent']
    const ok = await trigger(fields as any)
    if (!ok) return
    if (step < total) setStep(s => s+1)
  }

  async function onSubmit(values: FormData) {
    setBusy(true)
    const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ designer, answers: values }) })
    const data = await res.json()
    localStorage.setItem('colrvia:lastStory', JSON.stringify(data.story))
    router.push('/reveal')
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
              <label className="block text-sm mb-1">Lighting</label>
              <input {...register('lighting')} className="w-full border rounded-xl px-3 py-2" placeholder="Soft morning light..." />
              {errors.lighting && <p className="text-xs text-red-600 mt-1">Lighting required</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Mood</label>
              <input {...register('mood')} className="w-full border rounded-xl px-3 py-2" placeholder="Calm, energizing..." />
              {errors.mood && <p className="text-xs text-red-600 mt-1">Mood required</p>}
            </div>
          </div>
        )}
        {step===2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm mb-1">Style</label>
              <input {...register('style')} className="w-full border rounded-xl px-3 py-2" placeholder="Minimal, boho..." />
              {errors.style && <p className="text-xs text-red-600 mt-1">Style required</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Flooring</label>
              <input {...register('floor')} className="w-full border rounded-xl px-3 py-2" placeholder="Oak, tile..." />
              {errors.floor && <p className="text-xs text-red-600 mt-1">Floor info required</p>}
            </div>
          </div>
        )}
        {step===3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm mb-1">Accent colors or items</label>
              <input {...register('accent')} className="w-full border rounded-xl px-3 py-2" placeholder="Brass hardware, navy sofa..." />
              {errors.accent && <p className="text-xs text-red-600 mt-1">Accent required</p>}
            </div>
            <div className="text-sm text-neutral-600 bg-neutral-50 border rounded-xl p-3">Review your answers then generate your story.</div>
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
