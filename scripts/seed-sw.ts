#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
// explicit load for .env.local
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

interface Raw { code?:string; name?:string; hex?:string; lrv?:number|null; [k:string]:any }
interface Row { code:string; name:string; hex:string; lrv:number|null }

function validHex(h:string|undefined): string | null {
  if(!h) return null
  let x = h.trim()
  if(!x) return null
  if(!x.startsWith('#')) x='#'+x
  if(/^#([0-9a-fA-F]{6})$/.test(x)) return x.toUpperCase()
  return null
}
function normalizeCode(c:string|undefined): string | null {
  if(!c) return null
  let v = c.trim().replace(/\s+/g,' ')
  if(/^[0-9]{3,4}$/.test(v)) v = 'SW '+v
  v = v.replace(/^sw\s*/i,'SW ')
  if(/^SW\s*([0-9]{3,4})$/.test(v)){ v = 'SW '+v.match(/([0-9]{3,4})$/)![1] }
  return v
}
function normalizeName(n:string|undefined): string | null { return (n||'').trim() || null }

function loadData(): Raw[] {
  const primary = 'db/seeds/catalog_sw.json'
  const fallback = 'data/catalog_sw.json'
  const file = fs.existsSync(primary)? primary : (fs.existsSync(fallback)? fallback : null)
  if(!file){
    console.error('Seed file not found at db/seeds/catalog_sw.json or data/catalog_sw.json')
    process.exit(1)
  }
  const json = JSON.parse(fs.readFileSync(file,'utf8'))
  if(Array.isArray(json)) return json
  for(const k of ['colors','data','items']){
    if(Array.isArray(json[k])) return json[k]
  }
  console.error('Unsupported JSON shape; expected array or object with colors/data/items array')
  process.exit(1)
}

function prepare(): { rows:Row[]; skipped:number; failed:number; errors:Record<string,number> } {
  const raw = loadData()
  const rows:Row[] = []
  const errors:Record<string,number> = {}
  let skipped=0, failed=0
  for(const r of raw){
    const code = normalizeCode(r.code || (r as any).id || (r as any).number)
    const name = normalizeName(r.name as any || (r as any).colorName || (r as any).title)
    const hex = validHex(r.hex as any || (r as any).hexCode || (r as any).rgbHex)
    if(!code){ errors.no_code=(errors.no_code||0)+1; skipped++; continue }
    if(!name){ errors.no_name=(errors.no_name||0)+1; skipped++; continue }
    if(!hex){ errors.bad_hex=(errors.bad_hex||0)+1; skipped++; continue }
    let lrv: number | null = null
    if(typeof r.lrv === 'number') lrv = r.lrv
    rows.push({ code, name, hex, lrv })
  }
  return { rows, skipped, failed, errors }
}

async function upsert(rows:Row[]): Promise<{ inserted:number; updated:number; failed:number }>{
  let inserted=0, updated=0, failed=0
  const size=500
  for(let i=0;i<rows.length;i+=size){
    const slice = rows.slice(i,i+size)
    const { data, error } = await supabase.from('catalog_sw').upsert(slice, { onConflict:'code' }).select('code')
    if(error){ console.error('Upsert chunk failed', error.message); failed += slice.length; continue }
    inserted += slice.length // cannot easily distinguish insert/update without additional prefetch; treat as upserted
  }
  return { inserted, updated, failed }
}

async function count(table:string){
  const { count, error } = await supabase.from(table).select('id',{ count:'exact', head:true })
  if(error) return 0
  return count||0
}

async function main(){
  const { rows, skipped, failed, errors } = prepare()
  const res = await upsert(rows)
  const sw = await count('catalog_sw')
  console.log('Result', { parsed: rows.length + skipped, valid: rows.length, inserted: res.inserted, skipped, failed: failed + res.failed, errors })
  console.log(`SW catalog: ${sw}`)
  const behr = await count('catalog_behr')
  console.log(`Behr catalog: ${behr}`)
  if(failed + res.failed > 0){ process.exit(1) }
}
main().catch(e=>{ console.error(e.message); process.exit(1) })
