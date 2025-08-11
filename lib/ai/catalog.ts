import sw from '@/data/brands/sw.json'
import behr from '@/data/brands/behr.json'
import type { Brand, Paint } from '@/types/story'
import type { Color } from './schema'

// Preserve legacy catalog exports
const catalogs: Record<Brand, Paint[]> = { SW: sw as any, Behr: behr as any }
export const getCatalog = (brand: Brand): Paint[] => catalogs[brand]
export const findByTag = (brand: Brand, tag: string) => getCatalog(brand).filter(p => p.tags?.includes(tag))
export const byName = (brand: Brand, name: string) => getCatalog(brand).find(p => p.name === name)

// New normalized arrays for AI schema usage
function normalize(raw: any[], brand: string): Color[] {
  return (raw||[]).map(r => ({
    brand: (brand === 'SW' ? 'Sherwin-Williams' : 'Behr') as any,
    code: String(r.code || r.id || r.number || ''),
    name: String(r.name || ''),
    hex: String(r.hex || r.color || '#ffffff').toLowerCase()
  })).filter(c => /^#?[0-9a-f]{6}$/i.test(c.hex.replace('#','')))
}
export const SW: Color[] = normalize(sw as any[], 'SW')
export const BEHR: Color[] = normalize(behr as any[], 'Behr')

export function byBrand(brand?: string): Color[] {
  if (!brand) return [...SW, ...BEHR]
  if (/sher/i.test(brand)) return SW
  if (/behr/i.test(brand)) return BEHR
  return [...SW, ...BEHR]
}

function hexToRgb(hex: string){ const h = hex.replace('#',''); return { r:parseInt(h.slice(0,2),16), g:parseInt(h.slice(2,4),16), b:parseInt(h.slice(4,6),16) } }
function rgbToHsl(r:number,g:number,b:number){ r/=255; g/=255; b/=255; const max=Math.max(r,g,b), min=Math.min(r,g,b); let h=0,s=0,l=(max+min)/2; if(max!==min){ const d=max-min; s=l>0.5? d/(2-max-min): d/(max+min); switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break} h/=6 } return {h,s,l} }
export function hslFromHex(hex:string){ const {r,g,b}=hexToRgb(hex); return rgbToHsl(r,g,b) }
export function isNearWhite(c: Color){ const {l,s}=hslFromHex(c.hex); return l>0.88 && s<0.12 }
export function isNeutral(c: Color){ const {s,l}=hslFromHex(c.hex); return s<0.16 && l>0.25 && l<0.93 }
export function contrastScore(a: Color,b: Color){ return Math.abs(hslFromHex(a.hex).l - hslFromHex(b.hex).l) }
export function excludeByAvoid(c: Color, avoid?: string){ if(!avoid) return false; const a=avoid.toLowerCase(); const n=`${c.name} ${c.code}`.toLowerCase(); if(/green/.test(a) && /(green|sage|olive|mint|pine)/.test(n)) return true; if(/yellow/.test(a)&&/(yellow|gold|mustard|lemon)/.test(n)) return true; if(/pink/.test(a)&&/(pink|rose|blush)/.test(n)) return true; if(/blue/.test(a)&&/(blue|navy|indigo|aqua|teal)/.test(n)) return true; if(/red/.test(a)&&/(red|brick|terracotta|coral)/.test(n)) return true; if(/purple/.test(a)&&/(purple|violet|plum|lavender)/.test(n)) return true; return false }
