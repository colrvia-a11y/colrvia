import { NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'
import { VIA_CHAT_MODEL, VIA_CHAT_FAST_MODEL, AI_MAX_OUTPUT_TOKENS } from '@/lib/ai/config'
import { viaTools } from '@/lib/via/tools'

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
    // 1) Ask the model, offering tools it can call when needed
    let toolMessages: any[] = []
    let step = 0
    while (step < 3) {
      step++
      const r = await client.chat.completions.create({
        model,
        temperature: 0.2,
        max_tokens: AI_MAX_OUTPUT_TOKENS,
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyzeImageForUndertones',
              description: 'Analyze an image URL to estimate undertones and dominant swatches.',
              parameters: {
                type: 'object',
                properties: { url: { type: 'string', description: 'Publicly accessible image URL' } },
                required: ['url']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'getPaintFacts',
              description: 'Look up paint facts (brand, code, undertone, notes) by name or code.',
              parameters: {
                type: 'object',
                properties: { query: { type: 'string', description: 'E.g., "Alabaster" or "SW 7008"' } },
                required: ['query']
              }
            }
          }
        ],
        messages: [
          {
            role: 'system',
            content:
              'You are Via, a friendly paint expert. Use tools when asked about undertones in a specific photo or brand-specific facts. If a user mentions a photo but no image is provided, ask for an image upload first.'
          },
          ...messages,
          ...toolMessages
        ]
      })
      const choice = r.choices?.[0]
      const msg: any = choice?.message
      // If the model wants to call a tool, handle it then continue
      const calls = msg?.tool_calls
      if (Array.isArray(calls) && calls.length) {
        for (const call of calls) {
          const { name, arguments: argsStr } = call.function || {}
          let result: any = { error: 'unknown_tool' }
          try {
            const args = argsStr ? JSON.parse(argsStr) : {}
            if (name === 'analyzeImageForUndertones') {
              result = await viaTools.analyzeImageForUndertones(args.url)
            } else if (name === 'getPaintFacts') {
              result = await viaTools.getPaintFacts(args.query)
            }
          } catch (e:any) {
            result = { error: String(e?.message || e) }
          }
          toolMessages.push({
            role: 'tool',
            tool_call_id: call.id,
            name,
            content: JSON.stringify(result)
          })
        }
        continue
      }
      // No tool calls → return the answer
      const reply = msg?.content ?? ''
      return NextResponse.json({ reply, model })
    }
    // Fallback
    return NextResponse.json({ reply: 'Sorry—try rephrasing that question.', model })
  } catch (e: any) {
    return NextResponse.json({ error: 'chat_failed', detail: String(e?.message || e) }, { status: 500 })
  }
}
