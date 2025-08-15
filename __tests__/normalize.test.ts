import { describe, it, expect } from 'vitest'
import { normalizePaletteOrRepair } from '@/lib/palette/normalize-repair'
import { CatalogEmptyError } from '@/lib/errors'

const fakeSupabase = (rows: any[]) => ({
  from: () => ({
    select: () => ({
      in: async (_: string, __: any[]) => ({ data: rows, error: null }),
      order: (_: string, __: { ascending: boolean }) => ({
        limit: async (_n: number) => ({ data: rows, error: null }),
      }),
    }),
  }),
})

describe('normalizePaletteOrRepair', () => {
  it('throws CatalogEmptyError if fewer than five swatches are available', async () => {
    await expect(
      normalizePaletteOrRepair(undefined, undefined, {
        supabase: fakeSupabase([{}, {}, {}]) as any,
      }),
    ).rejects.toThrow(CatalogEmptyError)
  })
})

