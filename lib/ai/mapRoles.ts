import type { Palette as V2, Swatch as V2Swatch } from '@/lib/ai/schema'

export type LegacyRole = 'walls' | 'trim' | 'cabinets' | 'accent' | 'extra'
export type LegacySwatch = { role: LegacyRole; brand: string; code: string; name: string; hex: string }
export type LegacyPalette = { swatches: LegacySwatch[] }

function pickRole(swatches: V2Swatch[], role: V2Swatch['role']) { return swatches.find(s => s.role === role) }

export function mapV2ToLegacy(p: V2): LegacyPalette {
  const get = (r: V2Swatch['role']) => pickRole(p.swatches, r)
  const out: LegacySwatch[] = []
  const w = get('primary'); if (w) out.push({ role:'walls', brand:w.brand, code:w.code, name:w.name, hex:w.hex })
  const tr = get('trim'); if (tr) out.push({ role:'trim', brand:tr.brand, code:tr.code, name:tr.name, hex:tr.hex })
  const cabs = get('secondary'); if (cabs) out.push({ role:'cabinets', brand:cabs.brand, code:cabs.code, name:cabs.name, hex:cabs.hex })
  const acc = get('accent'); if (acc) out.push({ role:'accent', brand:acc.brand, code:acc.code, name:acc.name, hex:acc.hex })
  const ceil = get('ceiling'); if (ceil) out.push({ role:'extra', brand:ceil.brand, code:ceil.code, name:ceil.name, hex:ceil.hex })
  return { swatches: out }
}
