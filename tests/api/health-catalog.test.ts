import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => {
  const client = () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
    from: () => ({ select: async () => ({ count: 0 }) }),
  })
  return { supabaseServer: client, createSupabaseServerClient: client }
})

import * as route from '@/app/api/health/catalog/route'

describe('/api/health/catalog', () => {
  it('exports node runtime', () => {
    // @ts-ignore
    expect(route.runtime).toBe('nodejs')
  })

  it('returns 401 when unauthenticated', async () => {
    // @ts-ignore
    const res: Response = await route.GET(new Request('http://localhost/api/health/catalog'))
    expect(res.status).toBe(401)
  })
})
