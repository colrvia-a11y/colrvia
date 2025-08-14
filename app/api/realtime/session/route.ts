import SYSTEM_PROMPT from "@/lib/prompt/system";
import { startState, acceptAnswer, getCurrentNode, type InterviewState } from "@/lib/ai/onboardingGraph";

export const runtime = 'nodejs'

/**
 * POST /api/realtime/session
 * Starts or continues a Realtime interview session.
 * Body:
 *  - step: 'start' | 'answer'
 *  - voice, model: optional Realtime model params
 *  - state, content: required for step='answer'
 */
export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return new Response('OPENAI_API_KEY missing', { status: 500 })
  }
  try {
    const body = (await req.json().catch(() => ({}))) as {
      voice?: string
      model?: string
      step?: 'start' | 'answer'
      content?: string
      state?: InterviewState
    }
    const { voice, model, step = 'start', content = '', state } = body

    if (step === 'answer' && state) {
      const nextState = acceptAnswer(state, content)
      if (nextState.done) {
        return new Response(JSON.stringify({ state: nextState, done: true }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
      }
      const node = getCurrentNode(nextState)
      return new Response(JSON.stringify({ state: nextState, question: node.prompt }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const initState = startState()
    const node = getCurrentNode(initState)

    const rtModel = model || process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17'
    const rtVoice = voice || process.env.OPENAI_TTS_VOICE || 'alloy'

    const r = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: rtModel,
        voice: rtVoice,
        instructions:
          SYSTEM_PROMPT +
          "\n\nKeep replies warm, brief, and natural. Ask the user: " +
          node.prompt,
      }),
    })

    if (!r.ok) {
      const text = await r.text()
      return new Response(text || 'Failed to create realtime session', { status: r.status })
    }

    const data = await r.json().catch(() => ({}))
    return new Response(JSON.stringify({ ...data, state: initState, question: node.prompt }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    console.error('/api/realtime/session error', err)
    return new Response(err?.message ?? 'Unknown error', { status: 500 })
  }
}
