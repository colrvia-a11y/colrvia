import { z } from "zod"

export const NodeBase = z.object({
  id: z.string(),
  question: z.string().optional(),
  type: z.enum(["single","multi","end"]),
  key: z.string().optional(),                  // where to store the answer
  options: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
})

export const Branch = z.object({
  when: z.any(),   // JSON-logic-like object
  to: z.string(),
})

export const Next = z.union([
  z.string(),                         // next node id
  z.object({ if: z.array(Branch), else: z.string() }) // conditional branching
])

export const RuleNode = NodeBase.extend({
  next: Next.optional(),
})

export type TRuleNode = z.infer<typeof RuleNode>

export const FlowSchema = z.record(z.string(), RuleNode)

export function normalizeAnswer(value: unknown, node: TRuleNode) {
  if (node.type === "multi") {
    const arr = Array.isArray(value) ? value : String(value || "").split(",").map(s => s.trim()).filter(Boolean)
    const max = node.max ?? arr.length
    return [...new Set(arr)].slice(0, max)
  }
  return typeof value === "string" ? value : String(value ?? "")
}
