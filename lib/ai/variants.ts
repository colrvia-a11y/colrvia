import { Swatch, Brand } from '@/types/story'
import { contrastRatio, ensureContrast } from './color'

type Tweak = 'softer'|'bolder'

function shift(hex:string, mode:Tweak, amount=0.08): string {
  try {
    const h = hex.replace('#','')
    const v = parseInt(h,16)
    let r = (v>>16)&255, g=(v>>8)&255, b=v&255
    const f = mode==='softer'? (1+amount) : (1-amount)
    r=Math.max(0,Math.min(255,Math.round(r*f)))
    g=Math.max(0,Math.min(255,Math.round(g*f)))
    b=Math.max(0,Math.min(255,Math.round(b*f)))
    return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)
  } catch { return hex }
}

export function makeVariant(base: Swatch[], _brand: Brand, tweak: Tweak): Swatch[] {
  const rolesOrder = ['walls','trim','cabinets','accent','ceiling']
  const byRole: Record<string,Swatch|undefined> = {}
  base.forEach(s=>{ byRole[s.role]=s })
  const out: Swatch[] = []
  let wallsHex = byRole['walls']?.hex
  let trimHex = byRole['trim']?.hex
  if (wallsHex && trimHex) {
    // Shift walls & trim first
    wallsHex = shift(wallsHex, tweak)
    trimHex = shift(trimHex, tweak==='softer'? 'bolder':'softer', 0.05)
    // Ensure 3:1 contrast
    const ensured = ensureContrast(wallsHex, trimHex, 3)
    wallsHex = ensured.a; trimHex = ensured.b
  }
  for (const role of rolesOrder) {
    const cur = byRole[role]
    if (!cur) continue
    let hex = cur.hex
    if (role==='walls' && wallsHex) hex = wallsHex
    else if (role==='trim' && trimHex) hex = trimHex
    else if (role==='accent') {
      hex = shift(hex, tweak==='softer'? 'softer':'bolder', 0.12)
      // accent vs walls ≥2:1
      if (wallsHex) {
        let tries=0
        while (contrastRatio(hex, wallsHex) < 2 && tries<10) {
          hex = shift(hex, tweak==='softer'? 'softer':'bolder', 0.06)
          tries++
        }
      }
    }
    out.push({ ...cur, hex })
  }
  return out.slice(0,5)
}
