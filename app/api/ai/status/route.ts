export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { AI_ENABLE, AI_MODEL, HAS_OPENAI_KEY, VIA_CHAT_MODEL, VIA_CHAT_FAST_MODEL, VIA_INTERVIEW_MODEL, PALETTE_MODEL, REALTIME_MODEL } from '@/lib/ai/config'

export async function GET() {
  return NextResponse.json({
    enabled: AI_ENABLE && HAS_OPENAI_KEY,
    provider: 'openai',
    model: AI_MODEL,                 // default chat/narrative (legacy)
    via: {
      chatModel: VIA_CHAT_MODEL,
      chatFastModel: VIA_CHAT_FAST_MODEL,
      interviewModel: VIA_INTERVIEW_MODEL,
      paletteModel: PALETTE_MODEL
    },
    interview: {
      modes: ['realtime', 'form'],
      realtime: { model: REALTIME_MODEL, session: '/api/realtime/session', offer: '/api/realtime/offer' },
      form: { model: VIA_INTERVIEW_MODEL, endpoint: '/api/interview' }
    },
    hasKey: HAS_OPENAI_KEY
  })
}
