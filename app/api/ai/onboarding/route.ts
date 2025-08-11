export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { designers } from "@/lib/ai/designers"
import { startState, acceptAnswer, getNode, type InterviewState } from "@/lib/ai/onboardingGraph"

// augment designers with systemPrompt
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
    const q = getNode('ask-goal')
    utterance = await phrase(systemPrompt, `Greet briefly, then ask: "${q.prompt}"`, useLLM)
    return NextResponse.json({ state, utterance })
  }
  state = acceptAnswer(body.state, body.content)
  if(state.done){
    utterance = await phrase(systemPrompt, 'Thank them and confirm you have enough to design their palette. Be concise.', useLLM)
    return NextResponse.json({ state, utterance })
  }
  const next = getNode('ask-goal') // simplified reuse of prompt sequence
  utterance = await phrase(systemPrompt, `Acknowledge in ~5 words, then ask: "${next.prompt}"`, useLLM)
  return NextResponse.json({ state, utterance })
}

async function phrase(systemPrompt: string, userAsk: string, useLLM: boolean): Promise<string>{
  if(!useLLM){
    return userAsk.replace(/^.*then ask:\s*/i,'').replace(/^"|"$/g,'')
  }
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
      temperature: 0.4,
      max_tokens: 120,
      messages: [
        { role:'system', content: systemPrompt },
        { role:'user', content: userAsk }
      ]
    })
    return resp.choices[0]?.message?.content?.trim() || userAsk
  } catch {
    return userAsk
  }
}
