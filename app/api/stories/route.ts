export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';
import { normalizePalette } from '@/lib/palette';
import { buildPalette, seedPaletteFor } from '@/lib/ai/palette';
import { normalizePaletteOrRepair } from '@/lib/palette/normalize-repair';

// --- normalization helpers ---
const normalizeBrand = (b?: string) => {
  const s = (b ?? '').trim().toLowerCase();
  if (['sherwin-williams', 'sherwin_williams', 'sw', 'sherwin'].includes(s)) return 'sherwin_williams';
  if (['behr', 'behr®', 'behr paint'].includes(s)) return 'behr';
  return s; // unknown -> will fail refine
};

// Title is now optional; keep strict schema so unknown keys still 422.
const sanitizeTitle = (t?: string) => {
  if (!t) return undefined;
  const trimmed = t.trim().replace(/\s+/g,' ');
  if (!trimmed) return undefined;
  return trimmed.slice(0,120); // enforce max length
};

const BodySchema = z.object({
  brand: z.string().transform(normalizeBrand).optional(),
  designerKey: z.enum(['marisol','emily','zane']).default('marisol'),
  title: z.string().max(120).optional().transform(sanitizeTitle),
  vibe: z.string().optional(),
  lighting: z.enum(['daylight','evening','mixed']).optional(),
  room: z.string().optional(),
  inputs: z.record(z.any()).optional()
}).strict();

export async function POST(req: Request) {
  // guard JSON parsing
  let raw: unknown;
  try {
    raw = await req.json();
  } catch (e) {
    console.warn('STORIES_POST:INVALID_JSON', { error: String(e) });
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  console.log('STORIES_POST:RAW_KEYS', { keys: Object.keys((raw || {}) as any) });

  // zod validation + normalization (strict)
  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(raw ?? {});
  } catch (e) {
    const issues = (e as z.ZodError).issues?.map(i => ({ path: i.path.join('.'), message: i.message }));
    console.warn('STORIES_POST:INVALID_INPUT', issues);
    return NextResponse.json({ error: 'INVALID_INPUT', issues }, { status: 422 });
  }

  // SSR server client
  const supabase = supabaseServer();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    console.error('STORIES_POST:AUTH_MISSING', { userErr });
    return NextResponse.json({ error: 'AUTH_MISSING' }, { status: 401 });
  }

  // Force brand to sherwin_williams temporarily (SW-only mode)
  const brand = 'sherwin_williams'
  const vibe = parsed.vibe
  let built: any[] | undefined
  try {
    const aiInput = { designer: parsed.designerKey==='marisol'?'Marisol':'Emily', vibe: vibe || 'Cozy Neutral', brand:'SW', lighting:(parsed.lighting as any)||'mixed', hasWarmWood: !!(parsed.inputs as any)?.hasWarmWood, photoUrl:null }
    try { built = buildPalette(aiInput as any).swatches } catch {}
    if(!built || built.length===0){ built = seedPaletteFor({ brand:'SW' }) }
  } catch {}
  let normalizedPalette = await normalizePaletteOrRepair(built as any, vibe)
  if(!normalizedPalette){
    normalizedPalette = await normalizePaletteOrRepair([], vibe)
  }
  if(!normalizedPalette){
    console.error('CREATE_STORY_PALETTE_FINAL_FAIL', { inputs: { vibe, brand } })
    return NextResponse.json({ error:'PALETTE_INVALID' }, { status:422 })
  }
  // DB payload with safe defaults (no unknown columns like title)
  const payload = {
    user_id: user.id,
    designer_key: parsed.designerKey,
  brand,
    title: parsed.title ?? null,
    inputs: {
      vibe: parsed.vibe ?? null,
      lighting: parsed.lighting ?? null,
      room: parsed.room ?? null,
      ...(parsed.inputs ?? {})
    },
  palette: normalizedPalette,
    narrative: null,
    has_variants: false,
    status: 'new'
  } as const;

  try {
    const { data: row, error } = await supabase
      .from('stories')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      console.error('STORIES_POST:DB_INSERT_FAILED', {
        code: (error as any).code,
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        brand: payload.brand,
        keys: Object.keys(payload)
      });
  return NextResponse.json({ error: 'DB_INSERT_FAILED', detail: error.message }, { status: 400 });
    }

  console.log('CREATE_STORY_OK', { id: row.id, paletteCount: normalizedPalette.length })
  return NextResponse.json({ id: row.id }, { status: 201 });
  } catch (e) {
    // final safety net so Next.js never throws a Digest error
    console.error('STORIES_POST:FATAL', { error: String(e), stack: (e as any)?.stack });
    return NextResponse.json({ error: 'FATAL', detail: String(e) }, { status: 500 });
  }
}
