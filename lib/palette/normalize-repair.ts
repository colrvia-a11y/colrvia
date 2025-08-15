// lib/palette/normalize-repair.ts
// Normalizes a palette or repairs it using catalog data.

import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { CatalogEmptyError, NormalizeError } from '@/lib/errors'
import { roleOrder } from '@/lib/palette'
import type { PaletteRole } from '@/types/palette'

export type RawSwatch = { brand?: string; code?: string; name?: string; hex?: string } | string
export type NormalizedSwatch = {
  brand: 'sherwin_williams'
  code: string
  name: string
  hex: `#${string}`
  role: PaletteRole
}

export function coerceSWCode(input: string): string {
  const s = input.trim().toUpperCase().replace(/[-_]/g, ' ')
  const m = s.match(/SW\s*0*(\d{1,4})/)
  return m ? `SW ${m[1].padStart(4, '0')}` : s
}

// Minimal interface for tests to inject a fake supabase client
type SupabaseLite = {
  from: (table: string) => {
    select: (cols?: string) => {
      in: (
        col: string,
        vals: any[],
      ) => Promise<{ data: any[] | null; error: any }>
      order: (
        col: string,
        opts: { ascending: boolean },
      ) => {
        limit: (n: number) => Promise<{ data: any[] | null; error: any }>
      }
    }
  }
}

export async function normalizePaletteOrRepair(
  raw: RawSwatch[] | undefined | null,
  vibe: string | undefined,
  deps?: { supabase?: SupabaseLite },
): Promise<NormalizedSwatch[]> {
  try {
    const arr = Array.isArray(raw) ? raw : []
    const complete = arr.filter(
      (x: any) =>
        x &&
        /^sherwin_williams$/i.test(x.brand) &&
        x.code &&
        x.name &&
        /^#/i.test(x.hex),
    )
    if (complete.length === 5) {
      return complete.map((x: any, i: number) => ({
        brand: 'sherwin_williams',
        code: coerceSWCode(x.code),
        name: x.name,
        hex: x.hex.toUpperCase() as `#${string}`,
        role: roleOrder[i] ?? 'extra',
      }))
    }

    const wantedCodes = arr
      .map((x: any) => (typeof x === 'string' ? x : x?.code))
      .filter(Boolean)
      .map((c: string) => coerceSWCode(c))

    const FALLBACK: Record<string, string[]> = {
      cozy_neutral: ['SW 7008', 'SW 7036', 'SW 7043', 'SW 6204', 'SW 7005'],
      airy_coastal: ['SW 7005', 'SW 7064', 'SW 6478', 'SW 6232', 'SW 6525'],
      modern_warm: ['SW 7008', 'SW 7568', 'SW 7037', 'SW 9109', 'SW 9171'],
      default: ['SW 7008', 'SW 7036', 'SW 7043', 'SW 6204', 'SW 7005'],
    }
    const seed =
      FALLBACK[(vibe || '').toLowerCase().replace(/[^a-z]+/g, '_')] ||
      FALLBACK.default
    const targetCodes = Array.from(
      new Set([...wantedCodes, ...seed]),
    ).slice(0, 5)

    const sb = deps?.supabase ?? getSupabaseAdminClient()
    const { data, error } = await sb
      .from('catalog_sw')
      .select('code,name,hex')
      .in('code', targetCodes)
    if (error) {
      throw new NormalizeError(
        `Supabase query failed: ${error.message ?? error}`,
      )
    }
    const foundCodes = new Set((data || []).map((d) => d.code))
    let rows = data || []
    if (rows.length < 5) {
      const { data: topup, error: topErr } = await sb
        .from('catalog_sw')
        .select('code,name,hex')
        .order('name', { ascending: true })
        .limit(15)
      if (topErr) {
        throw new NormalizeError(
          `Supabase query failed: ${topErr.message ?? topErr}`,
        )
      }
      for (const r of topup || []) {
        if (rows.length >= 5) break
        if (!foundCodes.has(r.code)) {
          rows.push(r)
          foundCodes.add(r.code)
        }
      }
    }
    if (rows.length < 5) {
      throw new CatalogEmptyError()
    }
    return rows.slice(0, 5).map((d, i) => ({
      brand: 'sherwin_williams',
      code: coerceSWCode(d.code),
      name: d.name,
      hex: d.hex.toUpperCase() as `#${string}`,
      role: roleOrder[i] ?? 'extra',
    }))
  } catch (err: any) {
    if (err?.name === 'CatalogEmptyError' || err?.name === 'NormalizeError') {
      throw err
    }
    if (err?.name === 'ConfigError') throw err
    throw new NormalizeError(err?.message ?? 'Unknown error during normalization')
  }
}

