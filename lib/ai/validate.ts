import type { Palette, Swatch, PaletteRole } from './schema'
import { SW, BEHR } from './catalog'
const HEX = /^#?[0-9a-f]{6}$/i
const ROLES: PaletteRole[] = ['primary','secondary','accent','trim','ceiling']

const swIndex = new Map<string, Set<string>>()
;(function index() {
  if (swIndex.size) return
  const add = (brand: string, list: any[]) => {
    const set = new Set<string>()
    list.forEach(c => set.add(`${(c.code||'').toLowerCase()}|${(c.hex||'').toLowerCase()}|${(c.name||'').toLowerCase()}`))
    swIndex.set(brand.toLowerCase(), set)
  }
  add('Sherwin-Williams', SW as any[])
  add('Behr', BEHR as any[])
})()

function inCatalog(s: Swatch): boolean {
  const set = swIndex.get(String(s.brand||'').toLowerCase())
  if (!set) return false
  const key = `${String(s.code||'').toLowerCase()}|${String(s.hex||'').toLowerCase()}|${String(s.name||'').toLowerCase()}`
  return set.has(key)
}

export function validatePalette(p: Palette): { ok:true } | { ok:false; error:string } {
  if (!p?.swatches?.length) return { ok:false, error:'Missing swatches' }
  const seen = new Set<string>()
  for (const s of p.swatches) {
    if (!ROLES.includes(s.role)) return { ok:false, error:`Invalid role ${s.role}` }
    if (seen.has(s.role)) return { ok:false, error:`Duplicate role ${s.role}` }
    seen.add(s.role)
    if (!s.brand || !s.code || !s.name || !s.hex) return { ok:false, error:`Incomplete swatch for ${s.role}` }
    if (!HEX.test(String(s.hex))) return { ok:false, error:`Invalid hex for ${s.role}` }
    if (!inCatalog(s)) return { ok:false, error:`Not in catalog: ${s.brand} ${s.code}` }
  }
  for (const r of ROLES) if (!seen.has(r)) return { ok:false, error:`Missing role ${r}` }
  return { ok:true }
}
export function assertValidPalette(p: Palette) { const v = validatePalette(p); if (!v.ok) throw new Error(v.error) }
