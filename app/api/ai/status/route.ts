export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { AI_ENABLE, AI_MODEL, HAS_OPENAI_KEY } from '@/lib/ai/config'

export async function GET() {
  return NextResponse.json({
    enabled: AI_ENABLE && HAS_OPENAI_KEY,
    provider: 'openai',
    model: AI_MODEL,
    hasKey: HAS_OPENAI_KEY
  })
}
