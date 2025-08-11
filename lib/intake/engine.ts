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
