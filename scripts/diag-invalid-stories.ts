#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
const envLocal = path.resolve(process.cwd(), '.env.local')
if(fs.existsSync(envLocal)) dotenv.config({ path: envLocal }); else dotenv.config()
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
if(!url || !service){
  console.error('Missing env')
  process.exit(1)
}
const supabase = createClient(url, service, { auth: { persistSession: false } })

async function run(){
  const { data, error } = await supabase.from('stories')
    .select('id, brand, palette, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if(error){
    console.error('Query error')
    process.exit(1)
  }
  const invalid = (data||[]).filter(r => !Array.isArray(r.palette) || r.palette.length < 5)
  const counts: Record<string, number> = {}
  for(const row of invalid){
    const brand = (row.brand||'unknown').toString().toLowerCase()
    counts[brand] = (counts[brand]||0)+1
  }
  const total = invalid.length
  console.log(`Invalid total: ${total}`)
  console.log('By brand:')
  Object.keys(counts).sort().forEach(b => {
    console.log(`${b}: ${counts[b]}`)
  })
  invalid.slice(0,5).forEach(r => {
    console.log(`sample: ${r.id} (${(r.brand||'unknown').toString().toLowerCase()})`)
  })
}
run()
