#!/usr/bin/env tsx
import 'dotenv/config'
import fs from 'fs'
import path from 'path'

const seedsDir = path.resolve('db/seeds')
const candidates = fs.readdirSync(seedsDir)
  .filter(f=>/sw|sherwin/i.test(f) && /\.json$/i.test(f))
  .map(f=>({ file:f, size: fs.statSync(path.join(seedsDir,f)).size }))

if(candidates.length===0){
  console.log('No Sherwin-Williams seed JSON found in db/seeds')
  process.exit(0)
}

candidates.sort((a,b)=> b.size - a.size)
const chosen = candidates[0].file
const fullPath = path.join(seedsDir, chosen)
const raw = JSON.parse(fs.readFileSync(fullPath,'utf8'))

function unwrap(data:any): any[]{
  if(Array.isArray(data)) return data
  if(data && typeof data==='object'){
    for(const key of ['colors','data','items','result','results']){
      if(Array.isArray((data as any)[key])) return (data as any)[key]
    }
  }
  return []
}

const arr = unwrap(raw)
console.log('File:', fullPath)
console.log('Array length:', arr.length)
console.log('First object keys:', arr[0] ? Object.keys(arr[0]).join(',') : '(none)')

const pickKeys = (o:any)=>({
  code: o.code ?? o.id ?? o.number ?? o.sw ?? o.sw_code ?? o['Color ID'] ?? o.ColorID,
  name: o.name ?? o.colorName ?? o.title ?? o['Color Name'] ?? o.Name,
  hex: o.hex ?? o.hexCode ?? o.rgbHex ?? o['RGB Hex Value'] ?? o['RGB Hex']
})

arr.slice(0,3).forEach((o,i)=>{
  const picked = pickKeys(o)
  console.log(`Sample ${i+1}:`, JSON.stringify(picked))
})
