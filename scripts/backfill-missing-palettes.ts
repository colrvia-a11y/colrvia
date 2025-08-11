#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { normalizePalette } from '@/lib/palette'
import { buildPalette, seedPaletteFor } from '@/lib/ai/palette'

// Load env vars: prefer .env.local if present, otherwise fallback to default .env
const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
} else {
  dotenv.config()
}

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
    .select('id, palette, brand')
    .limit(1000)
  if(error) throw error
  let fixed=0, failed=0, skipped=0
  for(const row of data||[]){
    const isArray = Array.isArray(row.palette)
    const len = isArray ? row.palette.length : 0
    if(isArray && len >= 5){ skipped++; continue }
    try {
      const inputs:any = {
        designer: 'Marisol',
        brand: (row.brand||'SW').startsWith('SW')?'SW':'Behr',
        vibe: 'Cozy Neutral',
        lighting: 'mixed',
        hasWarmWood: false,
        photoUrl: null
      }
      let raw:any = null
      try { raw = buildPalette(inputs).swatches } catch {}
      if(!raw) raw = seedPaletteFor({ brand: inputs.brand, vibe: inputs.vibe })
      const normalized = normalizePalette(raw, inputs.brand)
      if(normalized.length < 5) throw new Error('REGEN_YIELDED_TOO_FEW')
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
