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

  it('returns AUTH_REQUIRED when API responds 401', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'AUTH_REQUIRED' })
    })
    const res = await mod.createPaletteFromInterview({ vibe: 'Custom' })
    expect(res).toEqual({ error: 'AUTH_REQUIRED' })
    vi.unstubAllEnvs()
  })

  it('returns CREATE_FAILED when API fails', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({})
    })
    const res = await mod.createPaletteFromInterview({ vibe: 'Custom' })
    expect(res).toEqual({ error: 'CREATE_FAILED' })
    vi.unstubAllEnvs()
  })
})
