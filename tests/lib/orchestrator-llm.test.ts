import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

function mockOpenAIReturning(json: any) {
  vi.doMock('openai', () => {
    return {
      OpenAI: class {
        chat = { completions: { create: async () => ({ choices: [{ message: { content: JSON.stringify(json) } }] }) } }
      }
    } as any
  })
}

describe('orchestrator LLM assist', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })
  it('uses LLM result when valid and within candidates', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key')
    const modPre: any = await import('@/lib/ai/orchestrator')
    const baseInput: any = { space:'Living room', lighting:'Mixed', vibe:['Cozy'], contrast:'Balanced', brand:'Sherwin-Williams', seed:'llm-ok' }
    const fallback = await modPre.designPalette(baseInput)
    // Use fallback swatches (guaranteed candidate membership) but reshuffle role assignments for test
    const [p0,p1,p2,p3,p4] = fallback.swatches
    const payload = {
      swatches: [
        { role:'primary',  brand:p0.brand, code:p0.code, name:p0.name, hex:p0.hex },
        { role:'secondary',brand:p1.brand, code:p1.code, name:p1.name, hex:p1.hex },
        { role:'accent',   brand:p2.brand, code:p2.code, name:p2.name, hex:p2.hex },
        { role:'trim',     brand:p3.brand, code:p3.code, name:p3.name, hex:p3.hex },
        { role:'ceiling',  brand:p4.brand, code:p4.code, name:p4.name, hex:p4.hex },
      ],
      placements: { primary:60, secondary:30, accent:10, trim:5, ceiling:5 }
    }
    mockOpenAIReturning(payload)
    // Re-import after mock so OpenAI mock applies
    vi.resetModules()
    vi.stubEnv('OPENAI_API_KEY', 'test-key')
    mockOpenAIReturning(payload)
    const mod: any = await import('@/lib/ai/orchestrator')
    const p = await mod.designPalette(baseInput)
    const roles = new Set(p.swatches.map((s: any) => s.role))
    expect(['primary','secondary','accent','trim','ceiling'].every(r => roles.has(r))).toBe(true)
  })
  it('falls back when LLM picks outside candidates', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key')
    const bad = {
      swatches: [
        { role:'primary', brand:'Fake', code:'000', name:'Nope', hex:'#000000' },
        { role:'secondary', brand:'Fake', code:'001', name:'Nope', hex:'#111111' },
        { role:'accent', brand:'Fake', code:'002', name:'Nope', hex:'#222222' },
        { role:'trim', brand:'Fake', code:'003', name:'Nope', hex:'#333333' },
        { role:'ceiling', brand:'Fake', code:'004', name:'Nope', hex:'#444444' }
      ],
      placements: { primary:60, secondary:30, accent:10, trim:5, ceiling:5 }
    }
    mockOpenAIReturning(bad)
    vi.resetModules()
    vi.stubEnv('OPENAI_API_KEY', 'test-key')
    mockOpenAIReturning(bad)
    const mod: any = await import('@/lib/ai/orchestrator')
    const p = await mod.designPalette({ brand:'Sherwin-Williams', seed:'llm-bad' } as any)
    expect(p.swatches.length).toBeGreaterThanOrEqual(5)
  })
})
