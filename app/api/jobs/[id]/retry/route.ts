import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: job } = await supabase
    .from('jobs')
    .select('input')
    .eq('id', params.id)
    .single()

  if (!job?.input) return NextResponse.json({ error: 'missing_input' }, { status: 400 })

  const { data: created, error } = await supabase
    .from('jobs')
    .insert({ user_id: user.id, status: 'queued', input: job.input })
    .select('id')
    .single()

  if (error || !created) return NextResponse.json({ error: 'create_failed' }, { status: 500 })

  await supabase.functions.invoke('render-worker', {
    body: { jobId: created.id, userId: user.id }
  }).catch(() => {})

  return NextResponse.json({ jobId: created.id, accepted: true })
}
