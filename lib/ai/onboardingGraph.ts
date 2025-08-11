// Richer structured interview graph with typed nodes & normalization
export type NodeType = 'single_select' | 'multi_select' | 'text' | 'yesno'
export type AnswerPrimitive = string | string[] | boolean | null
export type AnswerMap = Record<string, AnswerPrimitive>

export interface QuestionNode {
  key: string
  prompt: string
  type: NodeType
  options?: string[]
  min?: number
  max?: number
  when?: (answers: AnswerMap) => boolean
}

export interface InterviewState { answers: AnswerMap; currentKey?: string; done: boolean; rngSeed?: string }
export interface ChatMessage { role: 'assistant' | 'user'; content: string }

export const nodes: QuestionNode[] = [
  { key: 'space', type: 'single_select', prompt: 'Which space are we working on?', options: ['Living room','Bedroom','Kitchen','Bathroom','Whole home'] },
  { key: 'lighting', type: 'single_select', prompt: 'How’s the natural light?', options: ['Low','Mixed','Bright'] },
  { key: 'vibe', type: 'multi_select', prompt: 'Pick up to 2 vibe words.', options: ['Calm','Cozy','Airy','Moody','Crisp','Earthy'], min:1, max:2 },
  { key: 'contrast', type: 'single_select', prompt: 'Contrast preference?', options: ['Softer','Balanced','Bolder'] },
  { key: 'fixed', type: 'text', prompt: 'Any fixed finishes to consider (floors, cabinets, counters)?' },
  { key: 'avoid', type: 'text', prompt: 'Any colors/undertones to avoid?' },
  { key: 'trim', type: 'single_select', prompt: 'Trim & ceiling vibe?', options: ['Clean white','Creamy white','Same as walls','Darker trim'] },
  { key: 'brand', type: 'single_select', prompt: 'Pick a paint brand.', options: ['Sherwin-Williams','Behr'] },
]

const ORDER = nodes.map(n=>n.key)

export function getNode(key: string){ return nodes.find(n=>n.key===key)! }
export function getFirstQuestion(){ return nodes[0] }

function normalizeToOption(input: string, options: string[]): string | null {
  const s = input.trim().toLowerCase()
  if(!s) return null
  const exact = options.find(o=>o.toLowerCase()===s)
  if(exact) return exact
  const prefix = options.find(o=>o.toLowerCase().startsWith(s))
  return prefix ?? null
}

export function normalizeAnswer(userText: string, node: QuestionNode): AnswerPrimitive {
  const raw = (userText ?? '').toString().trim()
  if(!raw) return null
  switch(node.type){
    case 'yesno':
      return /^y(es)?\b/i.test(raw) ? true : /^(n|no)\b/i.test(raw) ? false : null
    case 'single_select':
      return node.options ? normalizeToOption(raw, node.options) : raw
    case 'multi_select': {
      if(!node.options) return [raw]
      const opts = node.options
      const tokens = raw.split(/[\s,]+/).filter(Boolean)
      const mapped = Array.from(new Set(tokens.map(t=>normalizeToOption(t, opts)).filter(Boolean))) as string[]
      const max = node.max ?? mapped.length
      return mapped.slice(0, max)
    }
    default:
      return raw
  }
}

export function nextKey(currentKey?: string, answers: AnswerMap = {}): string | undefined {
  if(!currentKey) return ORDER[0]
  const idx = ORDER.indexOf(currentKey)
  for(let i=idx+1;i<ORDER.length;i++){
    const k = ORDER[i]
    const n = getNode(k)
    if(!n.when || n.when(answers)) return k
  }
  return undefined
}

export function startState(): InterviewState { return { answers:{}, currentKey: ORDER[0], done:false } }

export function acceptAnswer(state: InterviewState, userText: string): InterviewState {
  const key = state.currentKey ?? ORDER[0]
  const node = getNode(key)
  const value = normalizeAnswer(userText, node)
  const answers = { ...state.answers, [key]: value }
  const k = nextKey(key, answers)
  if(!k) return { answers, currentKey: undefined, done: true }
  return { answers, currentKey: k, done: false }
}

export function mapAnswersToStoryInput(answers: AnswerMap){
  return {
    space: answers.space,
    lighting: answers.lighting,
    vibe: answers.vibe,
    contrast: answers.contrast,
    fixed: answers.fixed,
    avoid: answers.avoid,
    trim: answers.trim,
    brand: answers.brand,
    seed: `${answers.space}|${answers.vibe}|${answers.contrast}|${answers.brand}`
  }
}

export function getCurrentNode(state: InterviewState | undefined){
  const key = state?.currentKey ?? ORDER[0]
  return getNode(key)
}

// Backwards compatibility helpers (some legacy callers)
export type OnboardingAnswers = AnswerMap
export function isTerminalId(key?: string){ return !key }
export function isTerminal(id: string | undefined){ return isTerminalId(id) }
