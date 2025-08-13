// lib/metrics/logger.ts
import { calcCostUSD, TokenUsage } from './calc'
import { createAdminClient } from '@/lib/supabase/admin'

export interface LogAiUsageArgs extends TokenUsage {
  userId?: string | null
  sessionId?: string | null
  event: string
  model: string
  metadata?: Record<string, any>
}

// Inserts a row into ai_usage using the service role.
export async function logAiUsage(args: LogAiUsageArgs){
  try {
    const { model, event, userId, sessionId, metadata, ...rest } = args
    const breakdown = calcCostUSD(model, rest)
    const supa = createAdminClient()
    await supa.from('ai_usage').insert({
      user_id: userId || null,
      session_id: sessionId || null,
      event,
      model: breakdown.model,
      input_tokens: breakdown.inputTokens,
      output_tokens: breakdown.outputTokens,
      total_tokens: breakdown.totalTokens,
      cost_usd: breakdown.costUSD,
      metadata: metadata || {}
    })
    return breakdown
  } catch (e) {
    // Swallow errors to avoid impacting primary request path
    return null
  }
}
