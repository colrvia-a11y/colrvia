export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { questionText, answers } = await req.json()

  // Try OpenAI if KEY exists, else fall back to a rule-based explainer.
  const key = process.env.OPENAI_API_KEY
  const prompt = `Explain this interview question to a homeowner in 2-4 friendly sentences.
Question: "${questionText}"
Context (prior answers): ${JSON.stringify(answers ?? {}, null, 0)}
Keep it non-technical and give a quick example if helpful.`

  if (key) {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a friendly interior design assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    })
    if (!r.ok) return NextResponse.json({ explanation: defaultExplain(questionText) })
    const data = await r.json()
    const explanation = data?.choices?.[0]?.message?.content?.trim() || defaultExplain(questionText)
    return NextResponse.json({ explanation })
  }

  return NextResponse.json({ explanation: defaultExplain(questionText) })
}

function defaultExplain(questionText: string) {
  return `We ask “${questionText}” to better tailor recommendations. Answering in your own words is great; choose a suggested option if it fits.`
}
