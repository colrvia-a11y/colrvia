// lib/metrics/calc.ts
// Simple cost calculator for OpenAI-like pricing; extend as needed.
// Pricing source: approximate July 2025 public rates (USD per 1K tokens) – keep conservative.
// These are intentionally centralized so we can revise without touching instrumentation.

export interface TokenUsage { input_tokens?: number; output_tokens?: number; total_tokens?: number }
export interface CostBreakdown { model: string; inputTokens: number; outputTokens: number; totalTokens: number; costUSD: number }

// Map model substring / exact name to pricing (per 1K tokens)
// We allow flexible matching: first exact, then regex substring match order below.
const PRICING: Array<{ match: RegExp; input: number; output: number }> = [
  { match: /^gpt-4o-mini/i, input: 0.15, output: 0.60 },
  { match: /^gpt-4o(?!-mini)/i, input: 2.50, output: 10.00 },
  { match: /^o3-mini/i, input: 1.10, output: 4.40 },
  { match: /^o3/i, input: 5.00, output: 20.00 },
]

function findPricing(model: string){
  return PRICING.find(p => p.match.test(model)) || PRICING[0]
}

export function calcCostUSD(model: string, usage: TokenUsage): CostBreakdown {
  const pricing = findPricing(model)
  const inTok = usage.input_tokens ?? 0
  const outTok = usage.output_tokens ?? 0
  // Some APIs only give total_tokens; apportion 75/25 input/output if so.
  let inputTokens = inTok
  let outputTokens = outTok
  if (!inTok && !outTok && usage.total_tokens) {
    inputTokens = Math.round(usage.total_tokens * 0.75)
    outputTokens = usage.total_tokens - inputTokens
  }
  const totalTokens = inputTokens + outputTokens
  const cost = (inputTokens/1000)*pricing.input + (outputTokens/1000)*pricing.output
  return { model, inputTokens, outputTokens, totalTokens, costUSD: Number(cost.toFixed(6)) }
}
