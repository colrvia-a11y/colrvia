// Legacy endpoint: forward post bodies to new /api/ai/preferences
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'

export async function POST(req: Request){
  try {
    const body = await req.text()
    const resp = await fetch(new URL('/api/ai/preferences', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body
    })
    const json = await resp.text()
    return new NextResponse(json, { status: resp.status, headers:{ 'Content-Type':'application/json', 'X-Legacy':'onboarding' } })
  } catch {
    return NextResponse.json({ error:'Legacy endpoint unavailable' },{ status:500 })
  }
}
