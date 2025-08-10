import { DecodedSwatch } from '@/types/story'

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
