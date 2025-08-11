#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
const envLocal = path.resolve(process.cwd(), '.env.local')
if(fs.existsSync(envLocal)) dotenv.config({ path: envLocal }); else dotenv.config()
import { createClient } from '@supabase/supabase-js'
import { normalizePalette } from '@/lib/palette'
import { buildPalette, seedPaletteFor } from '@/lib/ai/palette'
import { getSWSeedPalette } from '@/lib/seed/sw_fallback'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if(!url || !key){
  console.error('Missing env')
  process.exit(1)
}
const supabase = createClient(url, key, { auth:{ persistSession:false } })

interface StoryRow { id:string; brand:string; palette:any; inputs:any }

async function fetchCandidates(limit:number, offset:number){
  const { data, error } = await supabase.rpc('stories_needing_sw_only', { limit_count: limit, offset_count: offset })
  if(error){
    // Fallback direct query if RPC not present
    const { data: fallback } = await supabase.from('stories')
      .select('id, brand, palette, inputs')
      .order('created_at', { ascending:false })
      .limit(limit)
    return (fallback||[]) as StoryRow[]
  }
  return (data||[]) as StoryRow[]
}

function isInvalidPalette(p:any){
  return !(Array.isArray(p) && p.length>=5)
}

async function migrate(){
  let fixed=0, failed=0, skipped=0
  let processedIds = new Set<string>()
  for(let pass=0; pass<10; pass++){
    const batch = await supabase.from('stories')
      .select('id, brand, palette, inputs')
      .or('brand.neq.sherwin_williams, palette.is.null, palette.eq.[]')
      .limit(200)
    if(batch.error){ break }
    const rows = (batch.data||[]) as StoryRow[]
    const targets = rows.filter(r=> !processedIds.has(r.id) && (r.brand!=='sherwin_williams' || isInvalidPalette(r.palette)))
    if(!targets.length) break
    for(const row of targets){
      processedIds.add(row.id)
      const vibeRaw = row.inputs?.vibe || row.inputs?.Vibe || 'Cozy Neutral'
      const vibe = (vibeRaw||'').toString()
      try {
        let candidate:any[] = []
        try { candidate = buildPalette({ brand:'SW', vibe, designer:'Marisol', lighting:'mixed', hasWarmWood:false, photoUrl:null } as any).swatches } catch {}
        if(!candidate || candidate.length===0) candidate = seedPaletteFor({ brand:'SW' })
        let norm:any[] = []
        try { norm = normalizePalette(candidate,'sherwin_williams' as any) } catch {}
        if(!norm || norm.length<5){
          const seed = await getSWSeedPalette(vibe)
          norm = normalizePalette(seed,'sherwin_williams' as any)
        }
        if(!norm || norm.length<5) throw new Error('norm_len')
        const { error } = await supabase.from('stories').update({ brand:'sherwin_williams', palette: norm }).eq('id', row.id)
        if(error) throw new Error(error.message)
        fixed++
      } catch(e:any){
        failed++
        console.error('MIGRATE_SW_ONLY_FAIL', row.id, e.message)
      }
    }
  }
  console.log(`MIGRATE_SW_ONLY → fixed: ${fixed}, skipped: ${skipped}, failed: ${failed}`)
}

migrate()
