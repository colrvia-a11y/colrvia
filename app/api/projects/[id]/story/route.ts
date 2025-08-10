import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const id = params.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data, error } = await supabase
    .from('projects')
    .select('story')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ story: data?.story || null })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const id = params.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { story } = body || {}
  if (!story || typeof story !== 'object' || Array.isArray(story)) {
    return NextResponse.json({ error: 'story must be an object' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ story })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('story')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ story: data?.story || null })
}
