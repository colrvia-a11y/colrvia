import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { makeVariant } from '@/lib/ai/variants'
import { decodePalette } from '@/lib/palette'
import { limitVariant } from '@/lib/rate-limit'

export async function GET() {
  console.warn('VARIANT_GET_DEPRECATED')
  return NextResponse.json({ error: 'USE_POST' }, { status: 405 })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const storyId = params.id
  const start = Date.now()
  console.log('VARIANT_POST_START', { storyId })
  let body: any = null
  try { body = await req.json() } catch {}
  const variantMode: 'softer'|'bolder' = body?.mode === 'bolder' ? 'bolder' : 'softer'
  const inputPalette = body?.palette
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return NextResponse.json({ error:'UNAUTHENTICATED' }, { status:401 })
  const { data: story, error } = await supabase.from('stories').select('*').eq('id', storyId).single()
  if(error || !story) return NextResponse.json({ error:'NOT_FOUND' }, { status:404 })
  if(story.user_id !== user.id) return NextResponse.json({ error:'FORBIDDEN' }, { status:403 })
  // rate limiting (best-effort, in-memory)
  const limited = limitVariant(user.id)
  if(!limited.ok){
    console.warn('VARIANT_POST_RATE_LIMIT', { storyId, scope: limited.scope })
    return NextResponse.json({ error:'RATE_LIMITED', scope: limited.scope, retryAfter: limited.retryAfter }, { status:429, headers:{ 'Retry-After': String(limited.retryAfter) } })
  }
  const basePalette = decodePalette(Array.isArray(inputPalette)? inputPalette : story.palette)
  if(basePalette.length===0){
    console.warn('VARIANT_POST_BAD_INPUT', { storyId, shape: typeof inputPalette })
    return NextResponse.json({ error:'INVALID_PALETTE' }, { status:422 })
  }
  const raw = makeVariant(basePalette as any, story.brand, variantMode)
  const variant = Array.isArray(raw)? raw : decodePalette(raw as any)
  if(!Array.isArray(variant) || variant.length===0){
    console.error('VARIANT_POST_FAIL', { storyId, reason:'EMPTY_RESULT' })
    return NextResponse.json({ error:'VARIANT_BUILD_FAILED' }, { status:500 })
  }
  console.log('VARIANT_POST_OK', { storyId, mode: variantMode, ms: Date.now()-start })
  return NextResponse.json({ variant })
}
