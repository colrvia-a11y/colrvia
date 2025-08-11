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
  console.error('Missing required env vars for seeding')
  process.exit(1)
}

const supabase = createClient(url, key, { auth:{ persistSession:false } })

interface Raw { [k:string]: any }
interface Row { code:string; name:string; hex:string|null; lab_l:number|null; lab_a:number|null; lab_b:number|null }

function toLab(hex?:string|null): [number|null, number|null, number|null]{
  if(!hex) return [null,null,null]
  const h = hex.replace('#','')
  if(h.length!==6) return [null,null,null]
  const r = parseInt(h.slice(0,2),16)/255
  const g = parseInt(h.slice(2,4),16)/255
  const b = parseInt(h.slice(4,6),16)/255
  // simple sRGB -> XYZ
  const lin = (c:number)=> c<=0.04045? c/12.92 : Math.pow((c+0.055)/1.055,2.4)
  const R=lin(r), G=lin(g), B=lin(b)
  const X = R*0.4124 + G*0.3576 + B*0.1805
  const Y = R*0.2126 + G*0.7152 + B*0.0722
  const Z = R*0.0193 + G*0.1192 + B*0.9505
  // XYZ -> Lab (D65)
  const xr = X/0.95047, yr=Y/1.0, zr=Z/1.08883
  const f=(t:number)=> t>0.008856? Math.cbrt(t) : (7.787*t + 16/116)
  const fx=f(xr), fy=f(yr), fz=f(zr)
  const L = (yr>0.008856? 116*Math.cbrt(yr)-16 : 903.3*yr)
  const a = 500*(fx-fy)
  const b2 = 200*(fy-fz)
  return [Number(L.toFixed(2)), Number(a.toFixed(2)), Number(b2.toFixed(2))]
}

function normalize(raw:Raw): Row | null {
  const code = (raw.code || raw.id || raw.number || '').toString().trim()
  const name = (raw.name || raw.colorName || raw.title || '').toString().trim()
  const hexRaw = (raw.hex || raw.hexCode || raw.rgbHex || '').toString().trim()
  if(!code || !name) return null
  let c = code.replace(/\s+/g,' ') // collapse
  if(/^sw\b/i.test(c)){
    c = c.replace(/^sw\s*/i,'SW ')
  }
  // ensure SW prefix pattern like SW 7008
  if(/^\d{3,4}$/.test(c)) c = 'SW '+c
  let hex: string | null = null
  if(/^#?[0-9a-fA-F]{6}$/.test(hexRaw)){
    hex = '#'+hexRaw.replace('#','').toLowerCase()
  }
  const [l,a,b] = toLab(hex)
  return { code:c, name, hex, lab_l:l, lab_a:a, lab_b:b }
}

async function upsertAll(rows:Row[]){
  const chunk=500
  let total=0
  for(let i=0;i<rows.length;i+=chunk){
    const slice = rows.slice(i,i+chunk)
    const { error } = await supabase.from('catalog_sw').upsert(slice, { onConflict:'code' })
    if(error){
      console.error('Upsert error', error.message)
      process.exit(1)
    }
    total += slice.length
  }
  console.log(`SW catalog upserted: ${total}`)
}

async function main(){
  const json = JSON.parse(fs.readFileSync('db/seeds/catalog_sw.json','utf8')) as Raw[]
  const rows:Row[] = []
  for(const r of json){
    const n = normalize(r)
    if(n) rows.push(n)
  }
  await upsertAll(rows)
}
main().catch(e=>{ console.error(e); process.exit(1) })
