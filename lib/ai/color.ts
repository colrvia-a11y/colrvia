// Lightweight color utilities: hex->LAB, deltaE (ΔE2000), contrast ratio, ensureContrast, undertone signal

export type LAB = { L: number; a: number; b: number }

import { differenceCiede2000 } from 'culori'

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#','')
  if (h.length === 3) {
    const r = parseInt(h[0]+h[0],16)
    const g = parseInt(h[1]+h[1],16)
    const b = parseInt(h[2]+h[2],16)
    return { r,g,b }
  }
  const int = parseInt(h,16)
  return { r:(int>>16)&255, g:(int>>8)&255, b:int&255 }
}

export function hexToLab(hex: string): LAB {
  const { r, g, b } = hexToRgb(hex)
  // sRGB -> XYZ
  const srgb = [r,g,b].map(v => {
    const c = v/255
    return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4)
  }) as [number,number,number]
  const [R,G,B] = srgb
  // Observer=2°, Illuminant=D65
  let X = R*0.4124 + G*0.3576 + B*0.1805
  let Y = R*0.2126 + G*0.7152 + B*0.0722
  let Z = R*0.0193 + G*0.1192 + B*0.9505
  // Normalize
  X /= 0.95047; Y /= 1.00000; Z /= 1.08883
  const f = (t:number)=> t>0.008856? Math.cbrt(t) : (7.787*t)+16/116
  const fx = f(X), fy = f(Y), fz = f(Z)
  const L = (116*fy)-16
  const a = 500*(fx-fy)
  const b2 = 200*(fy-fz)
  return { L, a, b: b2 }
}

// Precompute culori's ΔE2000 comparator
const deltaE2000 = differenceCiede2000()

export function deltaE(l1: LAB, l2: LAB): number {
  return deltaE2000(
    { mode: 'lab65', l: l1.L, a: l1.a, b: l1.b },
    { mode: 'lab65', l: l2.L, a: l2.a, b: l2.b }
  )
}

export function deltaEHex(hex1: string, hex2: string): number {
  return deltaE(hexToLab(hex1), hexToLab(hex2))
}

export function luminance(hex: string): number {
  const { r,g,b } = hexToRgb(hex)
  const f = (c:number)=> {
    const v = c/255
    return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4)
  }
  const R = f(r), G = f(g), B = f(b)
  return 0.2126*R + 0.7152*G + 0.0722*B
}

export function contrastRatio(fg: string, bg: string): number {
  const L1 = luminance(fg)
  const L2 = luminance(bg)
  const lighter = Math.max(L1,L2)
  const darker = Math.min(L1,L2)
  return (lighter + 0.05) / (darker + 0.05)
}

// Adjust a hex color lightness slightly toward target ratio
function nudgeTowardContrast(hex: string, against: string, target: number, direction: 'lighter'|'darker'): string {
  const { r,g,b } = hexToRgb(hex)
  const factor = direction==='lighter'? 1.05 : 0.95
  const nr = Math.max(0, Math.min(255, Math.round(r*factor)))
  const ng = Math.max(0, Math.min(255, Math.round(g*factor)))
  const nb = Math.max(0, Math.min(255, Math.round(b*factor)))
  const out = '#'+((1<<24)+(nr<<16)+(ng<<8)+nb).toString(16).slice(1)
  if (contrastRatio(out, against) >= target) return out
  return out
}

export function ensureContrast(a: string, b: string, target: number): { a: string; b: string } {
  let ca = a, cb = b
  let tries = 0
  while (contrastRatio(ca, cb) < target && tries < 20) {
    // Determine which to move (prefer modifying first param lightly)
    const lumA = luminance(ca), lumB = luminance(cb)
    if (lumA > lumB) {
      // make A lighter and B darker to stretch
      ca = nudgeTowardContrast(ca, cb, target, 'lighter')
      cb = nudgeTowardContrast(cb, ca, target, 'darker')
    } else {
      cb = nudgeTowardContrast(cb, ca, target, 'lighter')
      ca = nudgeTowardContrast(ca, cb, target, 'darker')
    }
    tries++
  }
  return { a: ca, b: cb }
}

export async function avgHueSaturationFromPhoto(_url: string): Promise<{ warm:boolean; cool:boolean; sat:number }> {
  // Placeholder: without canvas env we infer neutral; real impl could analyze image.
  return { warm:false, cool:false, sat:0.5 }
}

export function classifyUndertone(signals: { warm:boolean; cool:boolean }): 'warm'|'cool'|'neutral' {
  if (signals.warm && !signals.cool) return 'warm'
  if (signals.cool && !signals.warm) return 'cool'
  return 'neutral'
}
