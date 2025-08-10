import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';
import { buildPalette } from '@/lib/ai/palette';
import { buildNarrative, buildTitle } from '@/lib/ai/narrative';
import type { GenerateInput } from '@/types/story';
import { getUserTier } from '@/lib/profile';
const Body = z.object({
  designer: z.enum(['Emily','Zane','Marisol']),
  vibe: z.enum(['Cozy Neutral','Airy Coastal','Earthy Organic','Modern Warm','Soft Pastels','Moody Blue-Green']),
  brand: z.enum(['SW','Behr']),
  roomType: z.string().optional(),
  lighting: z.enum(['day','evening','mixed']),
  hasWarmWood: z.boolean(),
  photoUrl: z.string().url().optional().nullable()
});
export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:'UNAUTH' }, { status: 401 });
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error:'BAD_INPUT', details: parsed.error.flatten() }, { status: 400 });
  try {
    // Plan enforcement
    const { tier } = await getUserTier();
    if (tier === 'free') {
      const { count } = await supabase.from('stories').select('id', { count:'exact', head:true });
      if ((count ?? 0) >= 1) {
        return NextResponse.json({ code:'LIMIT_REACHED', message:'Free plan includes 1 saved Color Story. Upgrade to create more.' }, { status: 402 });
      }
    }
    const input: GenerateInput = parsed.data;
    const title = buildTitle(input);
    const { swatches, placements } = buildPalette(input);
    const narrative = buildNarrative(input, { palette: swatches, placements } as any);
    const toInsert = {
      user_id: user.id, title,
      designer: input.designer, vibe: input.vibe, brand: input.brand,
      room_type: input.roomType ?? null,
      lighting: input.lighting, has_warm_wood: input.hasWarmWood,
      photo_url: input.photoUrl ?? null,
      palette: swatches, placements, narrative, preview_url: null
    };
    const { data, error } = await supabase.from('stories').insert(toInsert).select('id').single();
    if (error) {
      console.error('DB_INSERT_FAILED stories table missing? Run /db/supabase.sql in Supabase SQL editor', error.message);
      return NextResponse.json({ error:'DB_INSERT_FAILED', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: data!.id }, { status: 201 });
  } catch (e:any) {
    console.error('STORIES_POST_ERROR', e);
    return NextResponse.json({ error:'SERVER_ERROR' }, { status: 500 });
  }
}
