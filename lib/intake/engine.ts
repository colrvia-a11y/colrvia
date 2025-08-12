import { FlowSchema, TRuleNode, normalizeAnswer } from "./schema"
import { evalLogic } from "./logic"

export type EngineState = {
  answers: Record<string, any>
  current?: string
}
export type StepResult =
  | { type:"question"; node: TRuleNode }
  | { type:"done" }

export function startFlow(flow: unknown): StepResult {
  const nodes = FlowSchema.parse(flow)
  const start = nodes["start"] || nodes[Object.keys(nodes)[0]]
  if (!start) throw new Error("No start node")
  return { type:"question", node: start }
}

export function nextStep(flow: unknown, state: EngineState, nodeId: string, rawAnswer: unknown): StepResult {
  const nodes = FlowSchema.parse(flow)
  const node = nodes[nodeId]
  if (!node) throw new Error("Unknown node")
  const answer = normalizeAnswer(rawAnswer, node)
  const answers = { ...state.answers }
  if (node.key) answers[node.key] = answer

  // decide next
  const n = node.next
  let nextId: string | undefined
  if (!n) { return { type:"done" } }
  if (typeof n === "string") nextId = n
  else if (n.if) {
    const ctx = { answers }
    const match = (n.if as any[]).find(b => evalLogic(b.when, ctx))
    nextId = match ? match.to : (n as any).else
  }
  if (!nextId || nodes[nextId]?.type === "end") return { type:"done" }
  return { type:"question", node: nodes[nextId] }
}

// ---------- Deterministic Questionnaire Engine ----------
import type { Answers, QuestionId, Priority } from './types'
import { QUESTIONS, getQuestionPriority } from './questions'
import { track } from '@/lib/analytics'

const HARD_CAP = 15
const DROP_ORDER: QuestionId[] = [
  'k_fixed_details',
  'b_fixed_details',
  'l_fixed_details',
  'o_coordination_preference',
  'dark_locations',
  'window_aspect',
  'h_adjacent_color',
]

function push(queue: QuestionId[], id: QuestionId) {
  if (!QUESTIONS[id]) return
  queue.push(id)
}

export function enforceCap(queue: QuestionId[]): QuestionId[] {
  if (queue.length <= HARD_CAP) return queue
  const dropped: { id: QuestionId; priority: Priority }[] = []
  for (const id of DROP_ORDER) {
    if (queue.length <= HARD_CAP) break
    const idx = queue.indexOf(id)
    if (idx >= 0) {
      const [d] = queue.splice(idx, 1)
      dropped.push({ id: d, priority: getQuestionPriority(d) })
      track('question_dropped', { id: d, priority: getQuestionPriority(d), reason: 'cap' })
    }
  }
  while (queue.length > HARD_CAP) {
    const d = queue.pop() as QuestionId
    dropped.push({ id: d, priority: getQuestionPriority(d) })
    track('question_dropped', { id: d, priority: getQuestionPriority(d), reason: 'cap' })
  }
  if (dropped.length) {
    track('flow_capped', { id: dropped[0].id, priority: dropped[0].priority, reason: 'cap' })
  }
  return queue
}

export function buildQuestionQueue(answers: Answers): QuestionId[] {
  const q: QuestionId[] = []
  push(q, 'room_type')
  push(q, 'mood_words')
  push(q, 'style_primary')
  push(q, 'light_level')
  if (answers.light_level === 'varies') push(q, 'window_aspect')
  push(q, 'dark_stance')
  if (answers.dark_stance && answers.dark_stance !== 'avoid') push(q, 'dark_locations')

  switch (answers.room_type) {
    case 'kitchen':
      push(q, 'k_fixed_elements')
      if ((answers.fixed_elements?.filter(e => ['ctops','backsplash','cabinets','flooring','appliances'].includes(e)).length || 0) >= 2 && !answers.fixed_elements?.includes('none'))
        push(q, 'k_fixed_details')
      break
    case 'bathroom':
      push(q, 'b_fixed_elements')
      if ((answers.fixed_elements?.filter(e => ['vanity_top','tile','fixtures_finish','bath_flooring'].includes(e)).length || 0) >= 2 && !answers.fixed_elements?.includes('none'))
        push(q, 'b_fixed_details')
      break
    case 'nursery':
    case 'bedroom_kid':
      push(q, 'n_theme_keepers')
      break
    case 'hallway_entry':
      push(q, 'h_flow_targets')
      if (answers.flow_targets && answers.flow_targets.length > 0) push(q, 'h_adjacent_color')
      break
    case 'open_concept':
      push(q, 'o_anchors_keep')
      push(q, 'l_anchors_keep')
      if ((answers.fixed_elements?.filter(e => ['wood_floor','fireplace','builtins_trim','major_furniture','rugs_textiles','artwork'].includes(e)).length || 0) >= 2 && !answers.fixed_elements?.includes('none'))
        push(q, 'l_fixed_details')
      push(q, 'o_coordination_preference')
      break
    default:
      if (['living_room','dining','bedroom_adult','home_office'].includes(answers.room_type as string)) {
        push(q, 'l_anchors_keep')
        if ((answers.fixed_elements?.filter(e => ['wood_floor','fireplace','builtins_trim','major_furniture','rugs_textiles','artwork'].includes(e)).length || 0) >= 2 && !answers.fixed_elements?.includes('none'))
          push(q, 'l_fixed_details')
      }
  }

  push(q, 'constraints')
  if (answers.constraints?.includes('color_rules')) push(q, 'avoid_colors')

  return enforceCap(q)
}
