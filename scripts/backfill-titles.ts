#!/usr/bin/env ts-node
/**
 * Backfill script: populate title for stories missing it.
 * Strategy: "Color Story <shortId>" or preserve existing non-null.
 * Run with: npx ts-node scripts/backfill-titles.ts
 */
import { createClient } from '@supabase/supabase-js'

function requireEnv(name:string){ const v=process.env[name]; if(!v) throw new Error(`Missing env ${name}`); return v }

async function main(){
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const service = requireEnv('SUPABASE_SERVICE_ROLE')
  const supabase = createClient(url, service, { auth:{ autoRefreshToken:false, persistSession:false } })

  console.log('Fetching stories without title...')
  const { data, error } = await supabase.from('stories').select('id,title').is('title', null).limit(5000)
  if(error){ console.error('Query failed', error); process.exit(1) }
  if(!data || data.length===0){ console.log('No rows to backfill'); return }
  for(const row of data){
    const short = row.id.slice(0,6)
    const newTitle = `Color Story ${short}`
    const { error: uErr } = await supabase.from('stories').update({ title:newTitle }).eq('id', row.id)
    if(uErr){ console.warn('Failed update', row.id, uErr.message) }
  }
  console.log('Backfill complete.')
}
main().catch(e=>{ console.error(e); process.exit(1) })
