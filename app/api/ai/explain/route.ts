import { NextResponse } from 'next/server'
import { VIA_INTERVIEW_MODEL, AI_MAX_OUTPUT_TOKENS } from '@/lib/ai/config'
import { getOpenAI } from '@/lib/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { questionText, answers } = await req.json()

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
    return NextResponse.json({ explanation })
  } catch {
    // Missing key or API error → fallback
    return NextResponse.json({ explanation: defaultExplain(questionText) })
  }
}

function defaultExplain(questionText: string) {
  return `We ask “${questionText}” to better tailor recommendations. Answering in your own words is great; choose a suggested option if it fits.`
}
