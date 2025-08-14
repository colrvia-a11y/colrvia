// tests/integration/createPaletteFromInterview.test.ts
import { describe, it, expect, vi } from 'vitest'
import * as mod from '@/lib/palette'

describe('createPaletteFromInterview', () => {
  it('returns {id} when API responds with { id }', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'abc' })
    })
    const res = await mod.createPaletteFromInterview({ vibe: 'Custom' })
    expect(res?.id).toBe('abc')
    vi.unstubAllEnvs()
  })

  it('returns {id} when API responds with { story: { id } }', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ story: { id: 'xyz' } })
    })
    const res = await mod.createPaletteFromInterview({ vibe: 'Custom' })
    expect(res?.id).toBe('xyz')
    vi.unstubAllEnvs()
  })

  it('prefers passed answers over localStorage', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const lsGet = vi.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null)
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'pass' })
    })
    const res = await mod.createPaletteFromInterview({ vibe: 'FromParam' })
    expect(res?.id).toBe('pass')
    expect(lsGet).toHaveBeenCalled()
    vi.unstubAllEnvs()
  })
})
