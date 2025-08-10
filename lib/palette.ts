import { DecodedSwatch } from '@/types/story'
import { z } from 'zod'
import type { PaletteArray, Swatch, BrandName, PaletteRole } from '@/types/palette'

// --- New strict palette normalizer ---
export const roleOrder: PaletteRole[] = ['walls','trim','cabinets','accent','extra']

const SwatchZ = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  hex: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i).optional().nullable(),
  role: z.enum(['walls','trim','cabinets','accent','extra']),
  brand: z.enum(['sherwin_williams','behr'])
})
export const PaletteArrayZ = z.array(SwatchZ).min(1)

export function normalizePalette(input: unknown, brand: BrandName): PaletteArray {
  const parsedArray = PaletteArrayZ.safeParse(input)
  if(parsedArray.success) return enforceOrder(parsedArray.data)
  if(isPlainObject(input)) {
    const obj = input as Record<string, any>
    const candidates: Swatch[] = []
    for(const role of roleOrder){
      const v = obj[role]
      if(v && typeof v === 'object') candidates.push(toSwatch(v, role, brand))
    }
    if(candidates.length===0){
      const keys = Object.keys(obj).filter(k=>/^color\d+$/i.test(k)).sort()
      keys.forEach((k,i)=> candidates.push(toSwatch(obj[k], roleOrder[i] ?? 'extra', brand)))
    }
    if(candidates.length>0) return enforceOrder(validateAll(candidates))
  }
  if(Array.isArray(input) && input.length>0 && typeof input[0] === 'string') {
    const wrapped = (input as string[]).slice(0,5).map((s,i)=> ({ name:s, code:s, hex: undefined, role: roleOrder[i] ?? 'extra', brand }))
    return enforceOrder(validateAll(wrapped))
  }
  throw Object.assign(new Error('PALETTE_NORMALIZE_FAILED'), { inputType: typeof input })
}
function toSwatch(v:any, role:PaletteRole, brand:BrandName): Swatch {
  const name = (v?.name ?? v?.label ?? v?.title ?? '').toString().trim() || 'Color'
  const code = (v?.code ?? v?.number ?? v?.id ?? name).toString().trim() || name
  const hex = v?.hex ?? v?.hexCode ?? null
  return { name, code, hex, role, brand }
}
function validateAll(list: Swatch[]): PaletteArray { const res = PaletteArrayZ.parse(list.filter(Boolean)); return res.slice(0,5) }
function enforceOrder(list: PaletteArray): PaletteArray { return [...list].sort((a,b)=> roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)) }
function isPlainObject(x:unknown): x is Record<string,unknown>{ return !!x && typeof x==='object' && !Array.isArray(x) }

function normalizeHex(h?: string): string | undefined {
  if(!h) return undefined
  let x = h.trim()
  if(!x) return undefined
  if(!x.startsWith('#')){
    if(/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(x)) x = '#'+x
  }
  if(/^#([0-9a-fA-F]{3})$/.test(x)){
    // expand short form
    const m = x.slice(1)
    x = '#' + m.split('').map(c=>c+c).join('')
  }
  if(/^#([0-9a-fA-F]{6})$/.test(x)) return x.toUpperCase()
  return undefined
}

function coerceItem(it: any): DecodedSwatch | null {
  if(!it || typeof it !== 'object') return null
  const hex = normalizeHex(it.hex || it.color || it.colour)
  const code = it.code || it.id || it.ref || undefined
  const name = it.name || it.label || code || undefined
  if(!hex && !code && !name) return null
  return {
    name,
    brand: it.brand || it.catalog || undefined,
    code,
    hex,
    role: it.role || undefined
  }
}

export function decodePalette(value: unknown): DecodedSwatch[] {
  if(Array.isArray(value)){
    const arr = value.map(coerceItem).filter(Boolean) as DecodedSwatch[]
    return arr
  }
  if(value && typeof value === 'object'){
    const v: any = value
    // common shapes
    const buckets: any[] = []
    if(Array.isArray(v.colors)) buckets.push(...v.colors)
    if(Array.isArray(v.swatches)) buckets.push(...v.swatches)
    const roles = ['primary','secondary','accent','neutral','support','highlight']
    for(const r of roles){
      if(v[r] && typeof v[r]==='object'){
        if(Array.isArray(v[r])) buckets.push(...v[r])
        else buckets.push(v[r])
      }
    }
    if(buckets.length){
      return buckets.map(coerceItem).filter(Boolean) as DecodedSwatch[]
    }
  }
  return []
}
