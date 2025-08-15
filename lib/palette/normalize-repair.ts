// lib/palette/normalize-repair.ts
// Normalizes a palette or repairs it using catalog data.

import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { CatalogEmptyError, NormalizeError } from '@/lib/errors'
import { roleOrder } from '@/lib/palette'
import type { PaletteRole } from '@/types/palette'
import { normalizePaintName, extractSwCode } from './normalize-utils'

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
type SupabaseLite = any

async function findByName(
  supabase: SupabaseLite,
  brand: 'Sherwin-Williams' | 'Behr',
  rawName?: string
) {
  if (!rawName) return null
  const nameKey = normalizePaintName(rawName)
  if (!nameKey) return null
  const table = brand === 'Behr' ? 'catalog_behr' : 'catalog_sw'
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .ilike('name', `%${nameKey.split(' ').slice(0, 3).join(' ')}%`)
    .order('name', { ascending: true })
    .limit(5)
  if (error || !data || data.length === 0) return null
  const perfect = data.find((d: any) => normalizePaintName(d.name) === nameKey)
  return perfect || data[0]
}

async function resolveSwatchWithCatalog(
  supabase: SupabaseLite,
  brand: 'Sherwin-Williams' | 'Behr',
  swatch: { code?: string; name?: string; hex?: string }
) {
  const extracted = extractSwCode(swatch.code || swatch.name)
  const table = brand === 'Behr' ? 'catalog_behr' : 'catalog_sw'
  if (extracted) {
    const { data } = await supabase.from(table).select('*').eq('code', extracted).limit(1)
    if (data && data[0]) return data[0]
  }
  const byName = await findByName(supabase, brand, swatch.name)
  if (byName) return byName
  return null
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
    const sb = deps?.supabase ?? getSupabaseAdminClient()
    const { data, error } = await sb
      .from('catalog_sw')
      .select('code,name,hex')
      .in('code', wantedCodes)
    if (error) {
      throw new NormalizeError(
        `Supabase query failed: ${error.message ?? error}`,
      )
    }
    const foundCodes = new Set((data || []).map((d: any) => d.code))
    let rows: any[] = data || []

    const missing = arr
      .map((x: any) => (typeof x === 'string' ? { code: x } : x))
      .filter((s: any) => s && (!s.code || !foundCodes.has(coerceSWCode(s.code))))

    for (const m of missing) {
      const hit = await resolveSwatchWithCatalog(sb, 'Sherwin-Williams', m as any)
      if (hit && !foundCodes.has(hit.code)) {
        rows.push(hit)
        foundCodes.add(hit.code)
      }
    }

    if (rows.length < 5) {
      const need = seed.filter((c) => !foundCodes.has(c)).slice(0, 5 - rows.length)
      if (need.length) {
        const { data: fb, error: fbErr } = await sb
          .from('catalog_sw')
          .select('code,name,hex')
          .in('code', need)
        if (fbErr) {
          throw new NormalizeError(
            `Supabase query failed: ${fbErr.message ?? fbErr}`,
          )
        }
        for (const r of fb || []) {
          if (rows.length >= 5) break
          if (!foundCodes.has(r.code)) {
            rows.push(r)
            foundCodes.add(r.code)
          }
        }
      }
    }

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
    if (process.env.NODE_ENV !== 'production') {
      const repairedCount = arr.filter((x: any) => {
        const c = typeof x === 'string' ? x : x?.code
        if (!c) return true
        return !foundCodes.has(coerceSWCode(c))
      }).length
      if (repairedCount > 0) {
        console.warn('[normalize] repaired swatches via fallback:', repairedCount)
      }
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

