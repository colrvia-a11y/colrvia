export const runtime = 'nodejs'
import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
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

  const resp = await client.responses.create({
    model: 'gpt-5-mini',
    input: [
      { role: 'system', content: 'You are Via, an interior paint specialist. Be precise and actionable.' },
      { role: 'user', content: JSON.stringify({ question, context }) },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'ViaAnswer', schema } } as any,
  } as any)

  return NextResponse.json(JSON.parse(resp.output_text || '{"answer":""}'))
}
