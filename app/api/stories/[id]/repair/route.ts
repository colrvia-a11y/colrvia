export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { repairStoryPalette } from '@/lib/palette/repair'
import { limitVariant } from '@/lib/rate-limit'

export async function POST(request: Request, { params }:{ params:{ id:string }}) {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({ error:'AUTH' }, { status:401 })
  const lim = limitVariant(user.id)
  if(!lim.ok) return NextResponse.json({ error:'RATE', scope: lim.scope }, { status:429 })
  const res = await repairStoryPalette({ id: params.id })
  if(!res.ok) return NextResponse.json(res, { status: 400 })
  return NextResponse.json(res, { status:200 })
}
