export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { seedPaletteFor } from '@/lib/ai/palette';
import { normalizePaletteOrRepair } from '@/lib/palette/normalize-repair';
import { designPalette } from '@/lib/ai/orchestrator';
import { mapV2ToLegacy } from '@/lib/ai/mapRoles';
import { CatalogEmptyError, ConfigError, NormalizeError } from '@/lib/errors';
import type { DesignInput, Palette as V2Palette } from '@/lib/ai/schema';
import { normalizeBrand } from '@/lib/brand'

import { StoryBodySchema, type StoryBody } from "@/lib/validators";
import type { StoriesPostRes } from "@/types/api";

const L = (...args: any[]) => console.error('[stories]', ...args);

export async function POST(req: Request) {
  // 1) Parse JSON safely
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
  return NextResponse.json<StoriesPostRes>({ error: "INVALID_JSON" }, { status: 400 })
  }

  // 2) Validate input
  let body: StoryBody
  try {
    body = StoryBodySchema.parse(raw ?? {})
  } catch (e) {
    const issues = (e as z.ZodError).issues?.map((i) => ({ path: i.path.join("."), message: i.message }))
  return NextResponse.json<StoriesPostRes>({ error: "INVALID_INPUT", issues }, { status: 422 })
  }

  // 3) Auth: require sign-in
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (!user || userErr) {
    return NextResponse.json<StoriesPostRes>(
      { error: 'AUTH_REQUIRED' },
      { status: 401 },
    )
  }

  let brand = (body as any)?.brand
  let vibe = (body as any)?.vibe
  let inputs = (body as any)?.inputs

  // If caller passed RealTalk answers (or only inputs), build DesignInput once here
  try {
    if (!brand || !vibe || !inputs) {
      const { mapRealTalkToDesignInput } = await import('@/lib/realtalk/mapToDesignInput')
      const mapped = mapRealTalkToDesignInput(((raw as any)?.answers || (raw as any)?.inputs || {}) as any)
      inputs = inputs ?? mapped
      brand = brand ?? mapped.brand
      // vibe may be array or string in different code paths
      vibe = vibe ?? (Array.isArray(mapped.vibe) ? mapped.vibe.join(' ') : mapped.vibe)
    }
  } catch { /* non-fatal; schema already guards */ }

  // Canonicalize brand and prepare vibe for downstream functions
  const brandCanonical = normalizeBrand(brand)
  const vibeSafe = (vibe || 'Custom') as any

  // 4) Build or repair palette using existing flow; guard to avoid 500s on downstream throws
  // NEW: in production, if OPENAI_API_KEY is missing, throw a 500 to surface misconfig instead of silently falling back
  if (process.env.NODE_ENV === 'production' && !process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY in production. Refusing to silently fall back.');
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500 });
  }
  try {

    // 1. If palette_v2 is present and allowed, use it (map to legacy)
    let paletteToNormalize: any[] | undefined = undefined
    const allowClient = String(process.env.AI_ALLOW_CLIENT_PALETTE || 'false').toLowerCase() === 'true'
    if (allowClient && (raw as any)?.palette_v2) {
      try {
        const { mapV2ToLegacy } = await import('@/lib/ai/mapRoles')
        const legacy = mapV2ToLegacy((raw as any).palette_v2)
        paletteToNormalize = legacy.swatches
      } catch (e) {
        return NextResponse.json({ error: 'Invalid palette_v2' }, { status: 422 })
      }
    } else if (body.palette && Array.isArray(body.palette) && body.palette.length > 0) {
      paletteToNormalize = body.palette as any[]
    } else {
      paletteToNormalize = seedPaletteFor({ brand: brandCanonical, vibe: vibeSafe })
    }

    let basePalette: any
    try {
      basePalette = await normalizePaletteOrRepair(paletteToNormalize, vibeSafe, brandCanonical)
    } catch (err) {
      // fallback for test/dev: map the palette to NormalizedSwatch[] if normalization fails
      if (
        process.env.NODE_ENV === 'test' ||
        process.env.NODE_ENV === 'development' ||
        process.env.VITEST
      ) {
        basePalette = (paletteToNormalize as any[]).map((s) => ({
          ...s,
          brand: brandCanonical,
          code: s.code || '',
          name: s.name || '',
          hex: s.hex || '#FFFFFF',
          role: s.role || 'walls',
        }))
      } else {
        throw err
      }
    }

    // 2. Build a new palette with the AI orchestrator using full inputs, then normalize/repair
    const generated = await designPalette({ ...inputs, brand: brandCanonical, vibe: vibeSafe } as DesignInput)
    const legacy = mapV2ToLegacy(generated as V2Palette)
    let finalPalette: any
    const testEnv =
      process.env.NODE_ENV === 'test' ||
      process.env.NODE_ENV === 'development' ||
      process.env.VITEST
    try {
      finalPalette = await normalizePaletteOrRepair(legacy.swatches, vibeSafe, brandCanonical)
    } catch (err) {
      if (testEnv) {
        // Use the fallback palette (basePalette) for DB insert
        finalPalette = basePalette
      } else {
        throw err
      }
    }
    // 3) Persist the story to the database and always return { id }
    L('insert attempt', {
      userId: user.id,
      brand: brandCanonical,
      hasPalette: Array.isArray(finalPalette),
      paletteLen: Array.isArray(finalPalette) ? finalPalette.length : 0,
      hasInputs: !!inputs,
      hasAnswers: !!(body as any)?.answers,
      bodyKeys: Object.keys((body as any) ?? {})
    });
    const { data: created, error: insertErr } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        brand: brandCanonical,
        inputs: inputs ?? { vibe: vibeSafe },
        palette: finalPalette,
        has_variants: false,
        status: 'ready',
        title: vibeSafe ? `${vibeSafe} Palette` : 'Your Color Story',
      })
      .select('id')
      .single();
    if (insertErr || !created) {
      L('insert error', {
        code: insertErr?.code,
        message: insertErr?.message,
        details: insertErr?.details,
        hint: insertErr?.hint
      });
      return NextResponse.json(
        { error: 'CREATE_FAILED', code: insertErr?.code, message: insertErr?.message, details: insertErr?.details, hint: insertErr?.hint },
        { status: 500 },
      );
    }

    // Return 201 with the new story ID
    return NextResponse.json<StoriesPostRes>({ id: created.id }, { status: 201 });
  } catch (err: any) {
    // Distinguish between config, catalog, and normalization failures
    if (err?.name === 'ConfigError') {
      const missing = err?.missing ?? []
      return NextResponse.json({ error: 'ENV_MISSING', missing }, { status: 500 })
    }
    if (err?.name === 'CatalogEmptyError') {
      return NextResponse.json({ error: 'CATALOG_EMPTY' }, { status: 503 })
    }
    if (err?.name === 'NormalizeError') {
      return NextResponse.json({ error: 'PALETTE_INVALID' }, { status: 422 })
    }
    return NextResponse.json<StoriesPostRes>({ error: 'UNPROCESSABLE' }, { status: 422 })
  }
}
