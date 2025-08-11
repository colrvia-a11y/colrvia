#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
const envLocal = path.resolve(process.cwd(), '.env.local')
if(fs.existsSync(envLocal)) dotenv.config({ path: envLocal }); else dotenv.config()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if(!url || !key){
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth:{ persistSession:false } })

interface Raw { [k:string]: any }
interface Row { code:string; name:string; hex:string|null; lab_l:number|null; lab_a:number|null; lab_b:number|null }

function toLab(hex?:string|null): [number|null, number|null, number|null]{
  if(!hex) return [null,null,null]
  const h = hex.replace('#','')
  if(h.length!==6) return [null,null,null]
  const srgb = [0,1,2].map(i=> parseInt(h.slice(i*2,i*2+2),16)/255)
  const lin = (c:number)=> c<=0.04045? c/12.92 : Math.pow((c+0.055)/1.055,2.4)
  const [R,G,B] = srgb.map(lin)
  const X = R*0.4124 + G*0.3576 + B*0.1805
  const Y = R*0.2126 + G*0.7152 + B*0.0722
  const Z = R*0.0193 + G*0.1192 + B*0.9505
  const xr = X/0.95047, yr=Y/1.0, zr=Z/1.08883
  const f=(t:number)=> t>0.008856? Math.cbrt(t) : (7.787*t + 16/116)
  const fx=f(xr), fy=f(yr), fz=f(zr)
  const L = (yr>0.008856? 116*Math.cbrt(yr)-16 : 903.3*yr)
  const a = 500*(fx-fy)
  const b2 = 200*(fy-fz)
  return [Number(L.toFixed(2)), Number(a.toFixed(2)), Number(b2.toFixed(2))]
}

function deriveHex(obj:Raw): string | null {
  const direct = obj.hex ?? obj.hexCode ?? obj.rgbHex ?? obj['RGB Hex Value'] ?? obj['RGB Hex']
  let hex = direct ? String(direct).trim() : ''
  if(hex){
    if(!hex.startsWith('#')) hex = '#'+hex
    if(/^#([0-9a-fA-F]{6})$/.test(hex)) return hex.toLowerCase()
  }
  const r = obj.r ?? obj.R ?? obj.red
  const g = obj.g ?? obj.G ?? obj.green
  const b = obj.b ?? obj.B ?? obj.blue
  if([r,g,b].every(v=> v!==undefined)){
    const toHex=(n:any)=>{ const num=Math.max(0,Math.min(255,parseInt(String(n),10)||0)); return num.toString(16).padStart(2,'0') }
    return '#'+toHex(r)+toHex(g)+toHex(b)
  }
  const rgbValue = obj['RGB Value'] || obj['RGB']
  if(rgbValue){
    const parts = String(rgbValue).split(/[,\s]+/).filter(Boolean).slice(0,3)
    if(parts.length===3 && parts.every(p=>/^\d+$/.test(p))){
      const nums = parts.map(p=>Math.max(0,Math.min(255,parseInt(p,10))))
      return '#'+nums.map(n=> n.toString(16).padStart(2,'0')).join('')
    }
  }
  return null
}

function normalizeCode(raw:any): string | null {
  let code = (raw?.code || raw?.id || raw?.number || raw?.sw || raw?.sw_code || raw['Color ID'] || raw.ColorID || '').toString().trim()
  if(!code) return null
  code = code.replace(/\s+/g,' ')
  code = code.replace(/^sw\s*/i,'SW ')
  if(/^[0-9]{3,4}$/.test(code)) code = 'SW '+code
  if(/^SW\s*([0-9]{3,4})$/i.test(code)){
    const m = code.match(/([0-9]{3,4})$/)![1]
    code = 'SW '+m
  }
  return code
}

function normalizeName(raw:any): string | null {
  const name = (raw?.name || raw?.colorName || raw?.title || raw['Color Name'] || raw.Name || '').toString().trim()
  return name || null
}

function extractArray(data:any): any[]{
  if(Array.isArray(data)) return data
  if(data && typeof data==='object'){
    for(const key of ['colors','data','items','result','results']){
      if(Array.isArray(data[key])) return data[key]
    }
  }
  return []
}

function buildRows(raw:any): Row[] {
  const arr = extractArray(raw)
  const reasons: Record<string,number> = {}
  const out:Row[] = []
  for(const obj of arr){
    const code = normalizeCode(obj)
    if(!code){ reasons.no_code=(reasons.no_code||0)+1; continue }
    const name = normalizeName(obj)
    if(!name){ reasons.no_name=(reasons.no_name||0)+1; continue }
    const hex = deriveHex(obj)
    const [l,a,b] = toLab(hex)
    out.push({ code, name, hex, lab_l:l, lab_a:a, lab_b:b })
  }
  if(Object.keys(reasons).length){
    const top = Object.entries(reasons).sort((a,b)=> b[1]-a[1]).slice(0,3).map(e=>e.join('='))
    console.log('Skip reasons:', top.join(','))
  }
  console.log(`Parsed: ${arr.length} Valid: ${out.length}`)
  return out
}

async function upsert(rows:Row[]){
  const size=500
  let total=0
  for(let i=0;i<rows.length;i+=size){
    const slice = rows.slice(i,i+size)
    const { error } = await supabase.from('catalog_sw').upsert(slice, { onConflict:'code' })
    if(error){
      console.error('Upsert error', error.message)
      console.log('SW catalog upserted: 0')
      await printCounts(true)
      if(rows.length>0) console.log('First object sample:', JSON.stringify(rows[0]))
      process.exit(1)
    }
    total += slice.length
  }
  console.log(`SW catalog upserted: ${total}`)
}

async function count(name:string): Promise<number>{
  const { count, error } = await supabase.from(name).select('id',{ count:'exact', head:true })
  if(error) return 0
  return count||0
}

async function printCounts(skipInvalid=false){
  const sw = await count('catalog_sw')
  const behr = await count('catalog_behr')
  console.log(`SW catalog: ${sw}`)
  console.log(`Behr catalog: ${behr}`)
  if(!skipInvalid){
    try {
      const { count: invalid } = await supabase.from('stories').select('id',{ count:'exact', head:true }).or('jsonb_typeof(palette).neq.array,palette.eq.[]')
      console.log(`Invalid stories: ${invalid||0}`)
    } catch { console.log('Invalid stories: 0') }
  }
}

async function main(){
  const seedsDir = path.resolve('db/seeds')
  const files = fs.readdirSync(seedsDir).filter(f=> /sw|sherwin/i.test(f) && /\.json$/i.test(f))
  if(!files.length){
    console.error('No SW seed JSON found')
    process.exit(1)
  }
  const chosen = files.map(f=> ({ f, size: fs.statSync(path.join(seedsDir,f)).size })).sort((a,b)=> b.size - a.size)[0].f
  const raw = JSON.parse(fs.readFileSync(path.join(seedsDir, chosen),'utf8'))
  const rows = buildRows(raw)
  await upsert(rows)
  await printCounts()
}

main().catch(e=>{ console.error(e.message); process.exit(1) })
