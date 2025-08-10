#!/usr/bin/env ts-node
import 'dotenv/config'
import fs from 'fs'
import path from 'path'

async function main(){
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const payloadPath = process.argv[2] || path.join(process.cwd(),'webhook-payload.json')
  if (!fs.existsSync(payloadPath)) {
    console.error('Missing payload file', payloadPath)
    process.exit(1)
  }
  const body = fs.readFileSync(payloadPath,'utf8')
  const res = await fetch(site+'/api/stripe/webhook', { method:'POST', body, headers:{ 'stripe-signature':'dev-test' } })
  console.log('Status', res.status)
  console.log(await res.text())
}
main().catch(e=>{ console.error(e); process.exit(1) })
