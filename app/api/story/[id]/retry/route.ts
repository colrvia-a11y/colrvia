import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// Creates a variation story duplicating input fields; sets parent_id relation if schema supports it.
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({ error:'unauthorized' }, { status:401 })
  const { data: base } = await supabase.from('stories').select('id,user_id,input,title,brand,vibe').eq('id', params.id).single()
  if(!base || base.user_id !== user.id) return NextResponse.json({ error:'not_found' }, { status:404 })
  const variationInput = base.input || {}
  const title = (base.title ? base.title+ ' (Variation)' : 'Design Variation')
  const { data: created, error } = await supabase.from('stories').insert({ user_id:user.id, status:'queued', input: variationInput, title, idempotency_key: null, parent_id: params.id }).select('id').single()
  if(error || !created) return NextResponse.json({ error:'create_failed' }, { status:500 })
  try { await supabase.functions.invoke('render-worker', { body:{ storyId: created.id, userId: user.id } }) } catch {}
  return NextResponse.json({ storyId: created.id, accepted:true })
}
