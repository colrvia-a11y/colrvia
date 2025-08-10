import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { makeVariant } from '@/lib/ai/variants'
import { markHasVariants } from '@/lib/db/stories'
import { randomUUID } from 'crypto'
import { buildNarrative } from '@/lib/ai/narrative'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 })
  const id = params.id
  const variantType = (req.nextUrl.searchParams.get('type') || 'softer') as 'softer' | 'bolder'

  const { data: base, error } = await supabase.from('stories').select('*').eq('id', id).single()
  if (error || !base) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  if (base.user_id !== user.id) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  if (base.variant && base.variant !== 'recommended') {
    return NextResponse.json({ error: 'BASE_ONLY' }, { status: 400 })
  }
  // look for cached variant
  const { data: existing } = await supabase.from('stories').select('*').eq('parent_id', base.id).eq('variant', variantType).maybeSingle?.()
  if (existing) return NextResponse.json(existing)

  const variantPalette = makeVariant(base.palette, base.brand, variantType)
  const narrative = buildNarrative({
    brand: base.brand,
    designer: base.designer,
    vibe: base.vibe,
    hasWarmWood: base.has_warm_wood,
    lighting: base.lighting,
    roomType: base.room_type,
    photoUrl: base.photo_url,
  } as any, { palette: variantPalette as any, placements: base.placements }) + ` (${variantType} take)`

  const newStory = {
    id: randomUUID(),
    user_id: user.id,
    title: `${base.title} — ${variantType.charAt(0).toUpperCase()+variantType.slice(1)}`,
    designer: base.designer,
    vibe: base.vibe,
    brand: base.brand,
    room_type: base.room_type,
    lighting: base.lighting,
    has_warm_wood: base.has_warm_wood,
    photo_url: base.photo_url,
    palette: variantPalette,
    placements: base.placements,
    narrative,
    preview_url: base.preview_url,
    parent_id: base.id,
    variant: variantType,
  }
  const { error: insertError } = await supabase.from('stories').insert(newStory as any)
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
  await markHasVariants(base.id)
  return NextResponse.json(newStory)
}
