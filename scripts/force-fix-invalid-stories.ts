#!/usr/bin/env tsx
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Ensure .env.local is loaded if standard dotenv didn't pick it up
const envLocal = path.resolve(process.cwd(), '.env.local')
if((!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) && fs.existsSync(envLocal)){
  try { require('dotenv').config({ path: envLocal }) } catch {}
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
if(!url || !service){
  console.error('Missing env')
  process.exit(1)
}
const supabase = createClient(url, service, { auth:{ persistSession:false } })

const FALLBACK_CODES = ['SW 7008','SW 7036','SW 7043','SW 6204','SW 7005'] as const

type CatRow = { code:string; name:string; hex:string }

async function buildFallbackPalette(){
  const { data } = await supabase.from('catalog_sw').select('code,name,hex').in('code', FALLBACK_CODES as any)
  const wanted: CatRow[] = (data||[]) as any
  const missing = FALLBACK_CODES.filter(c=> !wanted.find(w=> w.code===c))
  if(missing.length){
    const { data: fill } = await supabase.from('catalog_sw').select('code,name,hex').order('name',{ ascending:true }).limit(15)
    for(const row of (fill||[])){
      if(wanted.length>=5) break
      if(!wanted.find(w=>w.code===row.code)) wanted.push(row as any)
    }
  }
  if(wanted.length<5){
    throw new Error('Could not assemble fallback palette of 5')
  }
  return wanted.slice(0,5).map(r=> ({ brand:'sherwin_williams', code:r.code, name:r.name, hex:r.hex }))
}

function isInvalid(p:any){
  if(!Array.isArray(p)) return true
  if(p.length<5) return true
  return false
}

async function fetchAllStories(){
  const pageSize = 500
  let all: any[] = []
  for(let page=0; page<20; page++){
    const from = page*pageSize
    const to = from + pageSize -1
    const { data, error } = await supabase.from('stories').select('id,brand,palette').range(from,to)
    if(error){ break }
    if(!data || !data.length) break
    all = all.concat(data)
    if(data.length < pageSize) break
  }
  return all
}

async function run(){
  const palette = await buildFallbackPalette()
  const stories = await fetchAllStories()
  const invalid = stories.filter(s=> isInvalid(s.palette))
  let fixed=0, failed=0, skipped=0
  for(const row of invalid){
    try {
      const { error } = await supabase.from('stories').update({ brand:'sherwin_williams', palette }).eq('id', row.id)
      if(error) throw new Error(error.message)
      fixed++
    } catch(e){
      failed++
    }
  }
  console.log(`FORCE_FIX_INVALID → fixed: ${fixed}, skipped: ${skipped}, failed: ${failed}`)
}
run()
