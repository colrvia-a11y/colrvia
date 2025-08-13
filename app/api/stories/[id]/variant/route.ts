import type { VariantPostRes } from '@/types/api'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase/server'
import { makeVariant } from '@/lib/ai/variants'
import { decodePalette, normalizePalette } from '@/lib/palette'
import { limitVariant } from '@/lib/rate-limit'
import type { BrandName, PaletteArray } from '@/types/palette'
import { allowGuestWrites } from '@/lib/flags'
import { createAdminClient } from '@/lib/supabase/admin'

const VariantBodySchema = z.object({
  mode: z.enum(['recommended', 'softer', 'bolder']).default('recommended'),
  palette: z.unknown().optional(),
}).strict()
type VariantBody = z.infer<typeof VariantBodySchema>

export async function GET() {
  return NextResponse.json<VariantPostRes>({ error: 'USE_POST' }, { status: 405 })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const start = Date.now()
  const storyId = params.id

  // 1) Parse JSON safely
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    console.warn('VARIANT_POST_INVALID_JSON', { storyId })
  return NextResponse.json<VariantPostRes>({ error: 'INVALID_JSON' }, { status: 400 })
  }

  // 2) Validate body
  let body: VariantBody
  try {
    body = VariantBodySchema.parse(raw ?? {})
  } catch (e) {
    const issues = (e as z.ZodError).issues?.map(i => ({ path: i.path.join('.'), message: i.message }))
    console.warn('VARIANT_POST_INVALID_INPUT', { storyId, issues })
  return NextResponse.json<VariantPostRes>({ error: 'INVALID_INPUT', issues }, { status: 422 })
  }

  // 3) Auth (guest allowed when flag true)
  const supabase = supabaseServer()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if ((userErr || !user) && !allowGuestWrites()) {
    console.warn('VARIANT_POST_UNAUTH', { storyId })
    return NextResponse.json<VariantPostRes>({ error: 'UNAUTH' }, { status: 401 })
  }
  const acting = user ? supabase : createAdminClient()

  // 4) Rate limit (skip for guest for now)
  if (user) {
    const limit = limitVariant(user.id)
    if (!limit.ok) {
      return NextResponse.json<VariantPostRes>({ error: 'RATE_LIMIT', scope: limit.scope, retryAfter: limit.retryAfter } as any, { status: 429 })
    }
  }

  // 5) Load story (RLS ensures ownership for authed; for guest we rely on service role bypass)
  const { data: story, error } = await acting
    .from('stories')
    .select('id, palette, brand')
    .eq('id', storyId)
    .single()
  if (error || !story) {
    console.warn('VARIANT_POST_NOT_FOUND', { storyId })
  return NextResponse.json<VariantPostRes>({ error: 'NOT_FOUND' }, { status: 404 })
  }

  // 6) Normalize base palette
  const brand = (story.brand || 'sherwin_williams') as BrandName
  let base: PaletteArray
  try {
    const inputPalette = body.palette ?? story.palette
    base = normalizePalette(
      Array.isArray(inputPalette) ? inputPalette : (inputPalette as any),
      brand,
    )
  } catch {
    console.warn('VARIANT_POST_BAD_PALETTE', { storyId })
  return NextResponse.json<VariantPostRes>({ error: 'INVALID_PALETTE' }, { status: 422 })
  }

  // 7) Build + decode variant
  const tweak = body.mode === 'recommended' ? 'softer' : body.mode
  const rawVariant = makeVariant(base as any, story.brand, tweak as any)
  const decoded = Array.isArray(rawVariant) ? rawVariant : decodePalette(rawVariant as any)
  let variant: PaletteArray
  try {
    variant = normalizePalette(decoded, brand)
  } catch {
    console.error('VARIANT_POST_BUILD_FAIL', { storyId })
  return NextResponse.json<VariantPostRes>({ error: 'VARIANT_BUILD_FAILED' }, { status: 500 })
  }

  console.log('VARIANT_POST_OK', { storyId, mode: body.mode, ms: Date.now() - start })
  // Map DecodedSwatch[] to Swatch[] (PaletteArray) to satisfy type
  const swatches = (variant as any[]).map(s => ({
    name: s.name || '',
    brand: s.brand || 'sherwin_williams',
    code: s.code || '',
    hex: s.hex || '#FFFFFF',
    role: s.role || 'walls',
  }))
  return NextResponse.json<VariantPostRes>({ variant: swatches })
}
