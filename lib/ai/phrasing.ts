// lib/ai/phrasing.ts
import { makeRNG, pick } from "@/lib/utils/seededRandom"
import type { InterviewState, QuestionNode } from "@/lib/ai/onboardingGraph"
import { getDesigner } from "@/lib/ai/designers"

const ASK_TEMPLATES = [
  `Now, {Q}`,
  `Great. {Q}`,
  `Nice. {Q}`,
  `Got it. {Q}`,
  `Love it. {Q}`,
  `{Q}`
]

const GREETINGS: Record<string, string[]> = {
  minimalist: [
    "Let’s keep this crisp. ",
    "Quick decisions, great results. ",
    "We’ll move fast and clean. ",
  ],
  playful: [
    "Let’s make something fun. ",
    "Color energy incoming. ",
    "We’ll keep it upbeat. ",
  ],
  pro: [
    "I’ll guide you step by step. ",
    "Let’s get this dialed in. ",
    "We’ll keep it practical. ",
  ]
}

export function greeting(designerId: string, rngSeed: string, firstPrompt: string) {
  const rng = makeRNG(`${designerId}:${rngSeed}:greet`)
  const pre = pick(rng, GREETINGS[designerId] || ["Let’s go. "])
  return `${pre}${firstPrompt}`
}

export function ackFor(prevKey: string, userText: string, rngSeed: string) {
  const rng = makeRNG(`${prevKey}:${rngSeed}:ack`)
  const short = (s: string) => s.length > 60 ? s.slice(0, 57) + "…" : s
  switch(prevKey){
    case 'vibe': {
      const clean = userText.split(/[\s,]+/).filter(Boolean).slice(0,2)
      const joins = [
        `${clean.join(" + ")}—nice combo.`,
        `${clean.join(" + ")} works.`,
        `${clean.join(" + ")} feels right.`,
      ]
      return pick(rng, joins)
    }
    case 'lighting': {
      const m = userText.toLowerCase()
      if(m.startsWith('bri')) return pick(rng,["Bright light—great!","Bright—plenty to work with."])
      if(m.startsWith('low')) return pick(rng,["Low light—we’ll keep it soft.","Low—gentle tones help."])
      return pick(rng,["Mixed light—versatile.","Mixed—we’ll balance it."])
    }
    case 'contrast': {
      const m = userText.toLowerCase()
      if(m.startsWith('bold')) return pick(rng,["Bold—love it.","Bold it is."])
      if(m.startsWith('soft')) return pick(rng,["Soft—calm vibe.","Softer—serene."])
      return pick(rng,["Balanced—classic.","Balanced works."])
    }
    case 'brand': {
      const m = userText.toLowerCase().startsWith('sher')? 'Sherwin-Williams':'Behr'
      return pick(rng,[`${m}—solid choice.`,`${m} works great.`])
    }
    case 'avoid': return pick(rng,["Noted—avoiding it.","Got it—steering clear."])
    case 'fixed': return pick(rng,["Will match those.","Finishes noted."])
    case 'trim': return pick(rng,["Trim noted.","We’ll match trim."])
    default: return short(pick(rng,["Nice.","Great.","Got it.","Perfect."]))
  }
}

export function askFor(next: QuestionNode, rngSeed: string){
  const rng = makeRNG(`${next.key}:${rngSeed}:ask`)
  const t = pick(rng, ASK_TEMPLATES)
  return t.replace('{Q}', next.prompt)
}

export function buildStartUtterance(designerId: string, rngSeed: string, firstPrompt: string){
  return greeting(designerId, rngSeed, firstPrompt)
}

export function buildNextUtterance(ack: string, nextPrompt: string){
  return `${ack} ${nextPrompt}`
}
