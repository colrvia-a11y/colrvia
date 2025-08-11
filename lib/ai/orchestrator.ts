import type { DesignInput, Palette, PaletteRole, Swatch, Color } from './schema'
import { byBrand, isNearWhite, isNeutral, contrastScore, excludeByAvoid } from './catalog'
import { makeRNG, pick } from '@/lib/utils/seededRandom'

type Candidates = { neutrals: Color[]; whites: Color[]; accents: Color[] }

function getCandidates(input: DesignInput): Candidates {
  const all = byBrand(input.brand)
  const whites = all.filter(isNearWhite).filter(c => !excludeByAvoid(c, input.avoid))
  const neutrals = all.filter(isNeutral).filter(c => !excludeByAvoid(c, input.avoid))
  const accents = all.filter(c => !isNeutral(c) && !isNearWhite(c)).filter(c => !excludeByAvoid(c, input.avoid))
  const vibe = Array.isArray(input.vibe) ? input.vibe.join(' ').toLowerCase() : String(input.vibe||'').toLowerCase()
  const bias = (c: Color) => {
    const n = `${c.name} ${c.code}`.toLowerCase()
    if (/earthy|cozy/.test(vibe) && /(clay|sand|beige|taupe|oak|terracotta|sage|olive|moss|mud)/.test(n)) return true
    if (/airy|calm/.test(vibe) && /(mist|cloud|pearl|sea|sky|pale|frost|breeze)/.test(n)) return true
    if (/moody|crisp|bold/.test(vibe) && /(charcoal|ink|navy|black|graphite|night)/.test(n)) return true
    return false
  }
  const biasedAccents = accents.filter(bias).concat(accents)
  return { neutrals, whites, accents: biasedAccents }
}

function assignRolesDeterministic(input: DesignInput, C: Candidates): Palette {
  const seed = input.seed || `${input.space}|${input.vibe}|${input.contrast}|${input.brand}`
  const rng = makeRNG(seed)
  const poolN = C.neutrals.length ? C.neutrals : byBrand(input.brand).filter(isNeutral)
  const primary = pick(rng, poolN)
  const target = /bolder/i.test(String(input.contrast)) ? 0.28 : /softer/i.test(String(input.contrast)) ? 0.08 : 0.18
  const secondary = poolN.slice().sort((a,b)=> Math.abs(contrastScore(primary,a)-target) - Math.abs(contrastScore(primary,b)-target))[0] || primary
  const poolA = C.accents.length ? C.accents : byBrand(input.brand)
  const accent = poolA.filter(a => contrastScore(primary,a) > (target+0.05)).slice(0,200)[Math.floor(rng()*Math.min(200,Math.max(1,poolA.length)))] || poolA[0]
  const poolW = C.whites.length ? C.whites : byBrand(input.brand).filter(isNearWhite)
  const trim = pick(rng, poolW)
  const ceiling = poolW.slice().sort((a,b)=> Math.abs(contrastScore(primary,a)-0.35) - Math.abs(contrastScore(primary,b)-0.35))[0] || trim
  const toSwatch = (role: PaletteRole, c: Color): Swatch => ({ ...c, role })
  return { swatches: [toSwatch('primary',primary), toSwatch('secondary',secondary), toSwatch('accent',accent), toSwatch('trim',trim), toSwatch('ceiling',ceiling)], placements:{ primary:60, secondary:30, accent:10, trim:5, ceiling:5 }, notes:[`${input.contrast || 'Balanced'} contrast`] }
}

export async function designPalette(input: DesignInput): Promise<Palette> {
  const candidates = getCandidates(input)
  const fallback = assignRolesDeterministic(input, candidates)
  // LLM selection disabled (optional dependency not installed); use deterministic fallback
  return fallback
}
