#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js'
import { normalizePalette } from '@/lib/palette'

function requireEnv(name:string){ const v=process.env[name]; if(!v) throw new Error('Missing env '+name); return v }

async function main(){
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = requireEnv('SUPABASE_SERVICE_ROLE')
  const client = createClient(url, key, { auth:{ autoRefreshToken:false, persistSession:false } })
  const { data: rows, error } = await client.from('stories')
    .select('id, palette, brand')
    .limit(2000)
  if(error) throw error
  let fixed = 0, failed = 0
  for(const r of rows || []){
    const t = typeof r.palette
    const isArray = Array.isArray(r.palette)
    const len = isArray ? r.palette.length : 0
    if(isArray && len>0) continue
    try {
      const normalized = normalizePalette(r.palette, r.brand)
      const { error: upErr } = await client.from('stories').update({ palette: normalized }).eq('id', r.id)
      if(upErr) throw upErr
      fixed++
      console.log('BACKFILL_OK', r.id, normalized.length)
    } catch (e){
      failed++
      console.warn('BACKFILL_FAIL', r.id, (e as any)?.message)
    }
  }
  console.log('BACKFILL_DONE', { fixed, failed })
}
main().catch(e=>{ console.error(e); process.exit(1) })
