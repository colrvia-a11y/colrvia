"use client"
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/browser'
import { Skeleton } from '@/components/Skeleton'

type Job = { id:string; status:'queued'|'processing'|'ready'|'failed'; result: null | { images:{ url:string }[]; meta?:any }; error?: string | null }

export default function RevealJobPage({ params }:{ params:{ id:string } }){
  const supabase = supabaseBrowser()
  const [job, setJob] = useState<Job | null>(null)

  useEffect(()=> {
    supabase.from('jobs').select('id,status,result,error').eq('id', params.id).single().then(({ data }) => {
      if(data) setJob(data as Job)
    })
  },[params.id, supabase])

  useEffect(()=> {
    const channel = supabase.channel(`job:${params.id}`)
      .on('postgres_changes', { event:'*', schema:'public', table:'jobs', filter:`id=eq.${params.id}` }, (payload:any) => {
        setJob(payload.new as Job)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  },[params.id, supabase])

  const ready = job?.status === 'ready'
  const failed = job?.status === 'failed'

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
      {failed && (
        <div>
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-neutral-600 mb-4">{job?.error || 'Please try again.'}</p>
          <a href="/intake" className="inline-flex rounded-xl px-4 py-2 border">Try again</a>
        </div>
      )}
      {!ready && !failed && (
        <div>
          <h1 className="text-xl font-semibold mb-4">Generating your designs…</h1>
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length:4 }).map((_,i)=>(
              <div key={i} className="rounded-xl border p-3">
                <div className="aspect-video rounded-lg bg-neutral-200 animate-pulse mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">This takes about 8–15 seconds. You can keep browsing.</p>
        </div>
      )}
      {ready && (
        <div>
          <h1 className="text-xl font-semibold mb-4">Your designs</h1>
          <div className="grid md:grid-cols-2 gap-4">
            {job?.result?.images?.map((img,i)=>(
              <figure key={i} className="rounded-xl border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={`Variation ${i+1}`} className="w-full h-auto" loading={i>1? 'lazy':'eager'} />
                <figcaption className="p-2 text-sm text-neutral-600">Variation {i+1}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
