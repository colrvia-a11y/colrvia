#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
const envLocal = path.resolve(process.cwd(), '.env.local')
if(fs.existsSync(envLocal)) dotenv.config({ path: envLocal }); else dotenv.config()
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if(!url || !key){
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth:{ persistSession:false } })

type inputRow = { code?:any; name?:any; hex?:any; lrv?:any }
type row = { code:string; name:string; hex:string; lrv:number|null }

function normalizeHex(h:any): string | null {
  if(typeof h !== 'string') return null
  let v = h.trim()
  if(!v) return null
  if(!v.startsWith('#')) v = '#'+v
  if(/^#([0-9A-Fa-f]{6})$/.test(v)) return v.toUpperCase()
  return null
}

function normalizeCode(c:any): string | null {
  if(typeof c !== 'string') return null
  const v = c.trim()
  return v || null
}

function normalizeName(n:any): string | null {
  if(typeof n !== 'string') return null
  const v = n.trim()
  return v || null
}

async function main(){
  const file = 'db/seeds/catalog_sw.json'
  if(!fs.existsSync(file)){
    console.error('Seed file missing:', file)
    process.exit(1)
  }
  const raw = JSON.parse(fs.readFileSync(file,'utf8')) as inputRow[]
  if(!Array.isArray(raw)){
    console.error('Seed JSON must be an array')
    process.exit(1)
  }
  const rows: row[] = []
  let skippedMissingHex = 0
  for(const r of raw){
    const code = normalizeCode(r.code)
    const name = normalizeName(r.name)
    const hex = normalizeHex(r.hex)
    if(!code || !name){ continue }
    if(!hex){ skippedMissingHex++; continue }
    const lrv = (typeof r.lrv === 'number')? r.lrv : null
    rows.push({ code, name, hex, lrv })
  }

  const chunkSize = 500
  let upserted = 0
  for(let i=0;i<rows.length;i+=chunkSize){
    const slice = rows.slice(i,i+chunkSize)
    const { error } = await supabase.from('catalog_sw')
      .upsert(slice, { onConflict:'code' })
    if(error){
      console.error('Upsert failed', error.message)
      process.exit(1)
    }
    upserted += slice.length
  }
  if(skippedMissingHex>0) console.log(`skipped: ${skippedMissingHex} (missing hex)`) // optional note
  console.log(`SW catalog upserted: ${upserted}`)
}

main().catch(e=>{ console.error(e.message); process.exit(1) })
