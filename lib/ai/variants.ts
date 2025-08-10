import { Swatch, Brand } from '@/types/story'

// TODO: Enhance contrast adjustments using shared helpers.

type Tweak = 'softer'|'bolder'

function adjustHex(hex:string, mode:Tweak): string {
  // naive lighten/darken & desaturate placeholder; real logic could sample brand catalog
  try {
    const h = hex.replace('#','')
    const bigint = parseInt(h,16)
    let r = (bigint >> 16) & 255
    let g = (bigint >> 8) & 255
    let b = bigint & 255
    const factor = mode==='softer'?1.08:0.9
    r = Math.min(255, Math.round(r*factor))
    g = Math.min(255, Math.round(g*factor))
    b = Math.min(255, Math.round(b*factor))
    return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)
  } catch { return hex }
}

export function makeVariant(base: Swatch[], brand: Brand, tweak: Tweak): Swatch[] {
  const rolesOrder = ['walls','trim','cabinets','accent','ceiling']
  const byRole: Record<string,Swatch|undefined> = {}
  base.forEach(s=>{ byRole[s.role]=s })
  const out: Swatch[] = []
  for(const role of rolesOrder){
    const cur = byRole[role]
    if(!cur) continue
    let hex = cur.hex
    if(role==='walls' || role==='trim') hex = adjustHex(hex, tweak==='softer'?'softer':'bolder')
    if(role==='accent' && tweak==='bolder') hex = adjustHex(hex,'bolder')
    if(role==='accent' && tweak==='softer') hex = adjustHex(hex,'softer')
    out.push({ ...cur, hex })
  }
  return out.slice(0,5)
}
