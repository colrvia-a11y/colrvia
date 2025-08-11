#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { normalizePalette } from '@/lib/palette'
import { buildPalette, seedPaletteFor } from '@/lib/ai/palette'

const envLocal = path.resolve(process.cwd(), '.env.local')
if(fs.existsSync(envLocal)) dotenv.config({ path: envLocal }); else dotenv.config()
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if(!url || !key){
  console.error('Missing required env vars')
  process.exit(1)
}
const client = createClient(url, key, { auth:{ persistSession:false } })

async function countTable(name:string){
  const { count, error } = await client.from(name).select('id',{ count:'exact', head:true })
  if(error) return 0
  return count||0
}

async function main(){
  const swCount = await countTable('catalog_sw')
  const behrCount = await countTable('catalog_behr')

  const { count: invalidCount } = await client.from('stories')
    .select('id',{ count:'exact', head:true })
    .or('jsonb_typeof(palette).neq.array, palette.eq.[]')

  console.log(`SW catalog: ${swCount}`)
  console.log(`Behr catalog: ${behrCount}`)
  console.log(`Invalid stories: ${invalidCount||0}`)

  if((invalidCount||0)===0) return

  const { data } = await client.from('stories')
    .select('id, palette, brand')
    .limit(3)
  for(const row of data||[]){
    const isArray = Array.isArray(row.palette)
    const len = isArray ? row.palette.length : 0
    const paletteType = isArray ? 'array' : typeof row.palette
    let result = ''
    try {
      const inputs:any = { designer:'Marisol', brand: (row.brand||'SW').startsWith('SW')?'SW':'Behr', vibe:'Cozy Neutral', lighting:'mixed', hasWarmWood:false, photoUrl:null }
      let raw:any = null
      try { raw = buildPalette(inputs).swatches } catch { /* builder error */ }
      if(!raw) raw = seedPaletteFor({ brand: inputs.brand, vibe: inputs.vibe })
      const arr = normalizePalette(raw, inputs.brand)
      if(arr.length<5) throw new Error('REGENERATED_TOO_SHORT')
      result = `id=${row.id} brand=${row.brand} type=${paletteType} len=${len} → REGENERATED_OK(len ${arr.length})`
    } catch(e:any){
      result = `id=${row.id} brand=${row.brand} type=${paletteType} len=${len} → ${e.message||'ERROR'}`
    }
    console.log(result)
  }
}
main().catch(()=> process.exit(1))
