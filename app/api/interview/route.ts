export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { VIA_INTERVIEW_MODEL, REALTIME_MODEL, AI_MAX_OUTPUT_TOKENS } from '@/lib/ai/config'
import { getOpenAI } from '@/lib/openai'

type Mode = 'realtime' | 'form'

type Body = {
  mode?: Mode
  // For form mode:
  questionText?: string
  answers?: Record<string, any>
}

/**
 * POST /api/interview
 * body: { mode: 'realtime' } OR { mode: 'form', questionText, answers }
 *
 * - realtime: returns endpoints + model for the existing WebRTC Realtime flow
 * - form: runs the explainer using VIA_INTERVIEW_MODEL
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body
  const mode: Mode = (body.mode === 'realtime' ? 'realtime' : 'form')

  if (mode === 'realtime') {
    // We already have Realtime endpoints:
    //   /api/realtime/session → gets an EPHEMERAL client secret (browser uses this)
    //   /api/realtime/offer   → forwards the SDP to OpenAI
    return NextResponse.json({
      mode,
      model: REALTIME_MODEL,
      sessionEndpoint: '/api/realtime/session',
      offerEndpoint: '/api/realtime/offer'
    })
  }

  // Default: text form helper (explanation/clarification)
  const questionText = body.questionText || ''
  const answers = body.answers || {}

  const prompt = `Explain this interview question to a homeowner in 2-4 friendly sentences.
Question: "${questionText}"
Context (prior answers): ${JSON.stringify(answers ?? {}, null, 0)}
Keep it non-technical and give a quick example if helpful.`

  try {
    const client = getOpenAI()
    const r = await client.chat.completions.create({
      model: VIA_INTERVIEW_MODEL,
      messages: [
        { role: 'system', content: 'You are a friendly interior design assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: AI_MAX_OUTPUT_TOKENS
    })
    const explanation = r?.choices?.[0]?.message?.content?.trim() || defaultExplain(questionText)
    return NextResponse.json({ mode, model: VIA_INTERVIEW_MODEL, explanation })
  } catch (e: any) {
    console.error('[interview][form] error', e?.message || e)
    return NextResponse.json({ mode, model: VIA_INTERVIEW_MODEL, explanation: defaultExplain(questionText), fallback: true })
  }
}

function defaultExplain(questionText: string) {
  return `We ask “${questionText}” so your palette fits real-life use. A short answer in your own words is perfect; pick a suggested option if it fits.`
}

