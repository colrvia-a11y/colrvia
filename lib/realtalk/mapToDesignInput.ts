import type { Answers } from '@/lib/intake/types'
import type { DesignInput, Brand } from '@/lib/ai/schema'

function brandFrom(a?: string): Brand {
  if (!a) return 'Sherwin-Williams'
  return /behr/i.test(a) ? 'Behr' : 'Sherwin-Williams'
}
function lightingFrom(a?: string): DesignInput['lighting'] {
  const t = String(a || '').toLowerCase()
  if (t.includes('bright')) return 'Bright'
  if (t.includes('low') || t.includes('dim') || t.includes('dark')) return 'Low'
  return 'Mixed'
}
function contrastFrom(darkStance?: string): DesignInput['contrast'] {
  const t = String(darkStance || '').toLowerCase()
  if (t.includes('avoid')) return 'Softer'
  if (t.includes('walls')) return 'Bolder'
  // accents / open → balanced
  return 'Balanced'
}
function vibeFrom(style?: string, moods?: string[] | string): string {
  const s = (style || '').toString().replace(/_/g, ' ').trim()
  const m = Array.isArray(moods) ? moods.slice(0, 2).join(' ') : String(moods || '')
  const out = [s, m].filter(Boolean).join(' ').trim()
  return out || 'Custom'
}
function fixedFrom(a: Answers): string | undefined {
  const parts: string[] = []
  if (Array.isArray(a.fixed_elements) && a.fixed_elements.length) parts.push(a.fixed_elements.join(', '))
  if (a.fixed_details) parts.push(Object.values(a.fixed_details).join(', '))
  const s = parts.filter(Boolean).join('; ')
  return s ? s.slice(0, 300) : undefined
}

export function mapRealTalkToDesignInput(a: Answers): DesignInput {
  const brand = brandFrom(a.brand as any)
  const vibe = vibeFrom(a.style_primary as any, a.mood_words as any)
  const seedParts = Object.entries(a)
    .sort(([k1], [k2]) => k1.localeCompare(k2))
    .map(([, v]) => {
      if (Array.isArray(v)) return v.join('-')
      if (v && typeof v === 'object') return JSON.stringify(v)
      return String(v ?? '')
    })
  seedParts.push(brand)
  const seed = seedParts.join('|')

  return {
    space: (a.room_type || '').toString(),
    lighting: lightingFrom(a.light_level as any),
    vibe,
    contrast: contrastFrom(a.dark_stance as any),
    fixed: fixedFrom(a),
    avoid: Array.isArray(a.avoid_colors) ? a.avoid_colors.join(', ') : (a.avoid_colors as any),
    trim: undefined, // let orchestrator/defaults decide; wire later if you add a trim question
    brand,
    seed,
  }
}
