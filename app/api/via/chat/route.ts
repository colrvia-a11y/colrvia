import { NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'
import { VIA_CHAT_MODEL, VIA_CHAT_FAST_MODEL, AI_MAX_OUTPUT_TOKENS } from '@/lib/ai/config'

export const runtime = 'nodejs'
// Chat is live/user-specific; avoid build-time client creation.

type ChatMessage = { role: 'system'|'user'|'assistant'; content: string }
type Body = {
  messages: ChatMessage[]
  fast?: boolean
}

export async function POST(req: Request) {
  const { messages, fast }: Body = await req.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages required' }, { status: 400 })
  }
  const model = fast ? VIA_CHAT_FAST_MODEL : VIA_CHAT_MODEL
  try {
    const client = getOpenAI()
    const r = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.2,
      max_tokens: AI_MAX_OUTPUT_TOKENS
    })
    const reply = r?.choices?.[0]?.message?.content ?? ''
    return NextResponse.json({ reply, model })
  } catch (e: any) {
    return NextResponse.json({ error: 'chat_failed', detail: String(e?.message || e) }, { status: 500 })
  }
}
