import { NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { question, context } = await req.json().catch(() => ({}))
    if (!question) return NextResponse.json({ error: 'MISSING_QUESTION' }, { status: 400 })

    const schema = {
      type: 'object',
      properties: {
        answer: { type: 'string' },
        actions: { type: 'array', items: { type: 'string' } }, // e.g., ["suggest_trim", "check_contrast"]
      },
      required: ['answer'],
      additionalProperties: false,
    }

    const openai = getOpenAI()
    const resp = await openai.responses.create({
      model: 'gpt-5-mini',
      input: [
        { role: 'system', content: 'You are Via, an interior paint specialist. Be precise and actionable.' },
        { role: 'user', content: JSON.stringify({ question, context }) },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'ViaAnswer', schema } } as any,
    } as any)

    return NextResponse.json(JSON.parse(resp.output_text || '{"answer":""}'))
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Internal error' },
      { status: 500 }
    )
  }
}
