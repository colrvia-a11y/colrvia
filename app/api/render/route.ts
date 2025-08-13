import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseServer } from '@/lib/supabase/server'

function hashIdem(payload: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0,24)
}

export async function POST(req: Request){
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({ error:'unauthorized' }, { status:401 })
  const body = await req.json().catch(()=> ({})) as Record<string,unknown>
  const idempotency_key = hashIdem({ user:user.id, body })

  const { data: existing } = await supabase.from('jobs')
    .select('id,status')
    .eq('user_id', user.id)
    .eq('idempotency_key', idempotency_key)
    .single()

  if(existing){
    return NextResponse.json({ jobId: existing.id, accepted:true })
  }

  const { data: job, error } = await supabase.from('jobs')
    .insert({ user_id:user.id, status:'queued', input: body, idempotency_key })
    .select('id')
    .single()
  if(error || !job){
    return NextResponse.json({ error:'failed_to_create_job' }, { status:500 })
  }
  supabase.functions.invoke('render-worker', { body:{ jobId: job.id, userId: user.id }}).catch(()=>{})
  return NextResponse.json({ jobId: job.id, accepted:true })
}

export async function GET(){
  return NextResponse.json({ status:'deprecated_use_realtime' })
}
