#!/usr/bin/env tsx
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { normalizePalette } from '@/lib/palette'
import { buildPalette, seedPaletteFor } from '@/lib/ai/palette'

// Validate required environment variables early with a clear, boolean summary.
const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required env vars for backfill:', {
    NEXT_PUBLIC_SUPABASE_URL: !!NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY
  })
  process.exit(1)
}

async function main(){
  const client = createClient(
    NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!,
    { auth:{ persistSession:false } }
  )
  const { data, error } = await client.from('stories')
    .select('id, palette, brand, vibe, designer, lighting, has_warm_wood, photo_url, inputs')
    .or('jsonb_typeof(palette).eq.array') // fetch arrays then filter
    .limit(500)
  if(error) throw error
  let fixed=0, failed=0, skipped=0
  for(const row of data||[]){
    if(Array.isArray(row.palette) && row.palette.length>0){ skipped++; continue }
    try {
      const aiInput:any = { designer: row.designer || 'Marisol', vibe: row.vibe, brand: row.brand==='sherwin_williams'?'SW':'Behr', lighting: row.lighting||'mixed', hasWarmWood: !!row.has_warm_wood, photoUrl: row.photo_url }
      let candidate:any = null
      try { candidate = buildPalette(aiInput).swatches } catch {}
      if(!candidate || candidate.length===0) candidate = seedPaletteFor({ brand: aiInput.brand })
      const normalized = normalizePalette(candidate, row.brand)
      const { error: upErr } = await client.from('stories').update({ palette: normalized }).eq('id', row.id)
      if(upErr) throw upErr
      fixed++
      console.log('BACKFILL_MISSING_OK', row.id, normalized.length)
    } catch(e){ failed++; console.warn('BACKFILL_MISSING_FAIL', row.id, (e as any)?.message) }
  }
  console.log('BACKFILL_MISSING_DONE', { fixed, failed, skipped })
  if(failed>0) process.exit(1)
}
main().catch(e=>{ console.error(e); process.exit(1) })
