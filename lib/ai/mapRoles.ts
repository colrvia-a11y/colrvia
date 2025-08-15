import type { Palette as V2, Swatch as V2Swatch } from '@/lib/ai/schema'

export type LegacyRole = 'walls' | 'trim' | 'cabinets' | 'accent' | 'extra'
export type LegacySwatch = { role: LegacyRole; brand: string; code: string; name: string; hex: string }
export type LegacyPalette = { swatches: LegacySwatch[] }

const roleMap: Record<string, LegacyRole> = {
  primary: 'walls',
  secondary: 'cabinets',
  accent: 'accent',
  trim: 'trim',
  ceiling: 'extra',
}

export function mapV2ToLegacy(p: V2): LegacyPalette {
  const out: LegacySwatch[] = []
  const order: V2Swatch['role'][] = ['primary', 'trim', 'secondary', 'accent', 'ceiling']
  for (const role of order) {
    const s = (p.swatches as V2Swatch[]).find(sw => sw.role === role)
    if (s) {
      const legacyRole = roleMap[s.role]
      if (legacyRole) out.push({ role: legacyRole, brand: s.brand, code: s.code, name: s.name, hex: s.hex })
    }
  }
  return { swatches: out }
}
