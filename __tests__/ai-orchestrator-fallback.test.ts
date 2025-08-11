import { describe, it, expect } from 'vitest'
import { assignRolesDeterministic } from '@/lib/ai/orchestrator'
import type { DesignInput } from '@/lib/ai/schema'

describe('orchestrator fallback (OPENAI off)', () => {
  it('returns five roles deterministically', () => {
    const input: DesignInput = { brand: 'Sherwin-Williams', vibe: 'Cozy Neutral', contrast: 'Balanced', seed: 'test-seed' }
    const C = (assignRolesDeterministic as any) // exported; smoke-check via call
    const p = C(input, {
      neutrals: [],
      whites: [],
      accents: []
    }) // candidates can be minimal; implementation picks from catalog
    expect(p.swatches).toHaveLength(5)
    const roles = new Set(p.swatches.map((s:any)=>s.role))
    expect(roles.size).toBe(5)
  })
})
