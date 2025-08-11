export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { designers } from "@/lib/ai/designers"
import { startState, acceptAnswer, getCurrentNode, type InterviewState } from "@/lib/ai/onboardingGraph"
import { buildStartUtterance, buildNextUtterance, ackFor, askFor } from "@/lib/ai/phrasing"
import crypto from 'crypto'

const designerPrompts: Record<string,string> = {
  minimalist: 'You are a minimalist interior paint guide. Concise, calm, no fluff.',
  playful: 'You are an upbeat playful design buddy. Encouraging, vivid but brief.',
  pro: 'You are a seasoned interior designer. Professional, decisive, warm.'
}

interface StartBody { designerId: string; step: 'start' }
interface AnswerBody { designerId: string; step: 'answer'; content: string; state: InterviewState }
 type Body = StartBody | AnswerBody

export async function POST(req: Request) {
  const body = await req.json() as Body
  const designer = designers.find(d => d.id === body.designerId)
  if(!designer) return NextResponse.json({ error:'Unknown designer' },{ status:400 })
  const systemPrompt = designerPrompts[designer.id] || 'You are a helpful concise design assistant.'
  const useLLM = !!process.env.OPENAI_API_KEY
  let state: InterviewState
  let utterance = ''
  if(body.step === 'start'){
    state = startState()
    state.rngSeed = state.rngSeed || crypto.randomUUID()
    const q = getCurrentNode(state)
    const base = buildStartUtterance(designer.id, state.rngSeed!, q.prompt)
    utterance = await phrase(systemPrompt, base, useLLM)
    return NextResponse.json({ state, utterance })
  }
  state = acceptAnswer(body.state, body.content)
  state.rngSeed = state.rngSeed || body.state.rngSeed || crypto.randomUUID()
  if(state.done){
    const closing = 'Perfect—that’s enough to design your palette.'
    utterance = await phrase(systemPrompt, closing, useLLM)
    return NextResponse.json({ state, utterance })
  }
  const prevKey = body.state.currentKey || getCurrentNode(body.state).key
  const next = getCurrentNode(state)
  const ack = ackFor(prevKey, body.content, state.rngSeed || 'x')
  const ask = askFor(next, state.rngSeed || 'x')
  const base = buildNextUtterance(ack, ask)
  utterance = await phrase(systemPrompt, base, useLLM)
  return NextResponse.json({ state, utterance })
}

function clampWords(s: string, maxWords = 28){
  const w = s.split(/\s+/)
  if(w.length <= maxWords) return s
  return w.slice(0,maxWords).join(' ') + '…'
}

async function phrase(systemPrompt: string, base: string, useLLM: boolean): Promise<string>{
  if(!useLLM) return clampWords(base)
  try{
    if(!process.env.OPENAI_API_KEY) throw new Error('NO_KEY')
    const modName = 'openai'
    // @ts-ignore
    const dynamicMod = await (Function('m','return import(m)'))(modName).catch(()=>null)
    const OpenAI = dynamicMod?.OpenAI
    if(!OpenAI) throw new Error('NO_MOD')
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 80,
      messages: [
        { role:'system', content: systemPrompt + '\nConstraints: one short acknowledgment then one question; concise.' },
        { role:'user', content: `Rewrite more naturally: "${base}"` }
      ]
    })
    return clampWords(resp.choices[0]?.message?.content?.trim() || base)
  } catch {
    return clampWords(base)
  }
}
