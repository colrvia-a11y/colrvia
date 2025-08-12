import type { DesignInput, Palette, PaletteRole, Swatch, Color } from './schema'
import { validatePalette } from './validate'
import { PALETTE_GUIDELINES } from './guidelines'
import { byBrand, isNearWhite, isNeutral, contrastScore, excludeByAvoid } from './catalog'
import { makeRNG, pick } from '@/lib/utils/seededRandom'
import { capture, enabled as analyticsEnabled } from '@/lib/analytics/server'
import { AI_ENABLE, AI_MODEL, AI_MAX_OUTPUT_TOKENS, HAS_OPENAI_KEY } from '@/lib/ai/config'

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

function systemPrompt() {
  // Keep short, but include the centralized rules.
  return [
    'You are a senior interior colorist.',
    'Stay within provided candidates.',
    PALETTE_GUIDELINES.trim()
  ].join('\n')
}

function asKey(c: any) {
  return `${(c.brand||'').toLowerCase()}|${(c.code||'').toLowerCase()}|${(c.hex||'').toLowerCase()}`
}

function makeAllowedSet(candidates: Candidates) {
  const allowed = new Set<string>()
  for (const list of [candidates.neutrals, candidates.whites, candidates.accents]) {
    list.forEach(c => allowed.add(asKey(c)))
  }
  return allowed
}

function sanitizeLlmPalette(parsed: Palette | null, candidates: Candidates, fallback: Palette): Palette | null {
  if (!parsed?.swatches?.length) return null
  const allowed = makeAllowedSet(candidates)
  const roleSeen = new Set<PaletteRole>()
  const clean = parsed.swatches.filter((s: any) => {
    const k = asKey(s)
    if (roleSeen.has(s.role)) return false
    if (!allowed.has(k)) return false
    roleSeen.add(s.role)
    return true
  })
  const final: Palette = {
    swatches: clean,
    placements: parsed.placements || fallback.placements,
    notes: parsed.notes || fallback.notes
  }
  return final
}

async function tryLlmPick(input: DesignInput, candidates: Candidates, fallback: Palette): Promise<Palette | null> {
  if (!AI_ENABLE || !HAS_OPENAI_KEY) return null
  let OpenAIImpl: any
  try {
    const mod = await import('openai')
    OpenAIImpl = (mod as any).OpenAI
  } catch {
    return null
  }
  const client = new OpenAIImpl({ apiKey: process.env.OPENAI_API_KEY })
  const payload = {
    input,
    candidates: {
      neutrals: candidates.neutrals.slice(0, 100),
      whites: candidates.whites.slice(0, 100),
      accents: candidates.accents.slice(0, 100)
    }
  }
  const schema = {
    type: 'object',
    properties: {
      swatches: {
        type: 'array',
        minItems: 5,
        items: {
          type: 'object',
          properties: {
            role: { type: 'string', enum: ['primary','secondary','accent','trim','ceiling'] },
            brand: { type: 'string' },
            code: { type: 'string' },
            name: { type: 'string' },
            hex: { type: 'string' }
          },
          required: ['role','brand','code','name','hex'],
          additionalProperties: false
        }
      },
      placements: {
        type: 'object',
        properties: {
          primary: { type: 'number' },
          secondary: { type: 'number' },
          accent: { type: 'number' },
          trim: { type: 'number' },
          ceiling: { type: 'number' }
        },
        required: ['primary','secondary','accent','trim','ceiling'],
        additionalProperties: false
      },
      notes: { type: 'array', items: { type: 'string' } }
    },
    required: ['swatches','placements'],
    additionalProperties: false
  }
  // helper to call model with optional "fix" note
  async function callOnce(fixNote?: string) {
    const sys = systemPrompt()
    const user = {
      role: 'user' as const,
      content: JSON.stringify({ input, candidates: payload, schema })
    }
    const messages: any[] = [{ role: 'system', content: sys }, user]
    if (fixNote) messages.push({ role: 'system', content: `Fix the prior output: ${fixNote}` })
    const resp = await client.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: AI_MAX_OUTPUT_TOKENS,
      messages
    })
    if (analyticsEnabled() && (resp as any)?.usage) {
      await capture('ai_usage', { model: AI_MODEL, ...(resp as any).usage })
    }
    const parsed = JSON.parse(resp.choices[0]?.message?.content || '{}')
    return sanitizeLlmPalette(parsed, candidates, fallback)
  }
  try {
    // First attempt
    let cleaned = await callOnce()
    // If present but invalid, ask model to fix using our validator error
    if (cleaned) {
      const v = validatePalette(cleaned as any)
      if (!v.ok) {
        cleaned = await callOnce(`Validation error: ${v.error}. Use only provided candidates and include exactly one of each role.`)
      }
    }
    if (analyticsEnabled()) {
      await capture('orch_llm', {
        ok: Boolean(cleaned && cleaned.swatches?.length >= 5),
        neutrals: candidates.neutrals.length,
        whites: candidates.whites.length,
        accents: candidates.accents.length
      })
    }
    return cleaned ?? null
  } catch {
    return null
  }
}

export async function designPalette(input: DesignInput): Promise<Palette> {
  const candidates = getCandidates(input)
  const fallback = assignRolesDeterministic(input, candidates)
  const t0 = Date.now()
  if (analyticsEnabled()) {
    await capture('orch_start', { brand: input.brand || 'mixed', contrast: input.contrast || 'balanced', lighting: input.lighting || 'unknown' })
    await capture('orch_candidates', { neutrals: candidates.neutrals.length, whites: candidates.whites.length, accents: candidates.accents.length })
  }
  const assisted = await tryLlmPick(input, candidates, fallback).catch(()=>null)
  if (!assisted || !assisted.swatches || assisted.swatches.length < 5) {
    if (analyticsEnabled()) {
      await capture('orch_fallback', { reason: (AI_ENABLE && HAS_OPENAI_KEY) ? 'llm_invalid_or_error' : 'llm_disabled', ms: Date.now() - t0 })
      await capture('orch_result', { roles: 5, via: 'deterministic', ms: Date.now() - t0 })
    }
    return fallback
  }
  const roleSet = new Set(assisted.swatches.map(s=>s.role))
  if (roleSet.size < 5) {
    if (analyticsEnabled()) {
      await capture('orch_fallback', { reason: 'duplicate_roles', ms: Date.now() - t0 })
      await capture('orch_result', { roles: 5, via: 'deterministic', ms: Date.now() - t0 })
    }
    return fallback
  }
  if (analyticsEnabled()) {
    await capture('orch_result', { roles: assisted.swatches.length, via: 'llm', ms: Date.now() - t0 })
  }
  return assisted
}

export { getCandidates, assignRolesDeterministic }
