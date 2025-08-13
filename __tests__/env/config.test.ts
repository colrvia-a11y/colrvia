// __tests__/env/config.test.ts
import { describe, it, expect, vi } from 'vitest'

describe('AI_MODEL selection', () => {
  it('prefers COLRVIA_LLM_MODEL, then AI_MODEL, then OPENAI_MODEL, then default', async () => {
    vi.resetModules()
    process.env.COLRVIA_LLM_MODEL = 'gpt-5-mini'
    let cfg = await import('@/lib/ai/config')
    expect(cfg.AI_MODEL).toBe('gpt-5-mini')

    vi.resetModules()
    delete process.env.COLRVIA_LLM_MODEL
    process.env.AI_MODEL = 'gpt-4o-mini'
    cfg = await import('@/lib/ai/config')
    expect(cfg.AI_MODEL).toBe('gpt-4o-mini')

    vi.resetModules()
    delete process.env.AI_MODEL
    process.env.OPENAI_MODEL = 'gpt-4o'
    cfg = await import('@/lib/ai/config')
    expect(cfg.AI_MODEL).toBe('gpt-4o')

    vi.resetModules()
    delete process.env.OPENAI_MODEL
    cfg = await import('@/lib/ai/config')
    expect(cfg.AI_MODEL).toBe('gpt-4o-mini')
  })
})
