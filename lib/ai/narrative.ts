import { getDesigner } from '@/lib/ai/designers'
import { AI_ENABLE, AI_MODEL, AI_MAX_OUTPUT_TOKENS, HAS_OPENAI_KEY } from '@/lib/ai/config'
import { capture, enabled as analyticsEnabled } from '@/lib/analytics/server'

type LegacySwatch = { role: string; brand: string; code: string; name: string; hex: string }

function pick<T>(arr: T[], role: string): T | undefined {
  const roles = Array.isArray(arr) ? (arr as any[]) : []
  return roles.find((s: any) => s.role === role) as any
}

export function buildDeterministicNarrative(opts: {
  input: { contrast?: string; lighting?: string; vibe?: string | string[]; brand?: string }
  palette: Array<LegacySwatch | any>
}) {
  const { input, palette } = opts
  const vibe = Array.isArray(input.vibe) ? input.vibe.join(' + ') : (input.vibe || 'Balanced')
  const contrast = input.contrast || 'Balanced'
  const lighting = input.lighting || 'Mixed'
  const brand = input.brand || (palette?.[0] as any)?.brand || 'Sherwin-Williams'

  const primary: any = pick(palette as any, 'primary') || pick(palette as any, 'walls')
  const secondary: any = pick(palette as any, 'secondary') || pick(palette as any, 'cabinets')
  const accent: any = pick(palette as any, 'accent')
  const trim: any = pick(palette as any, 'trim')
  const ceiling: any = pick(palette as any, 'ceiling') || pick(palette as any, 'extra')

  const lines = [
    `We targeted a ${contrast.toLowerCase()} contrast for ${lighting.toLowerCase()} light and your “${vibe}” vibe.`,
    primary ? `Walls lead with ${primary.name} (${primary.code}) for an easy, livable base.` : '',
    secondary ? `Secondary surfaces get ${secondary.name} (${secondary.code}) to add depth.` : '',
    accent ? `${accent.name} (${accent.code}) is your accent—kept intentional so it doesn’t overpower.` : '',
    trim ? `Trim stays crisp in ${trim.name} (${trim.code}).` : '',
    ceiling ? `Ceilings lighten the room with ${ceiling.name} (${ceiling.code}).` : '',
    `All from ${brand} for simple touch-ups.`,
  ].filter(Boolean)

  const out = lines.join(' ')
  const sentences = out.split(/\.\s+/).filter(Boolean)
  return sentences.slice(0, 3).join('. ') + '.'
}

export async function polishWithLLM(text: string, designerId?: string) {
  if (!AI_ENABLE || !HAS_OPENAI_KEY) return text
  const d = getDesigner(designerId || '')
  const system = `${d?.style || ''}\nConstraints: 2–3 short sentences, warm and specific. Keep facts.`
  try {
    const { OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const resp = await client.chat.completions.create({
      model: AI_MODEL,
      temperature: 0.3,
      max_tokens: Math.min(120, AI_MAX_OUTPUT_TOKENS),
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Rewrite more naturally, keep facts: ${text}` },
      ],
    })
    if (analyticsEnabled() && (resp as any)?.usage) {
      await capture('ai_usage', { model: AI_MODEL, ...(resp as any).usage })
    }
    const t = resp.choices[0]?.message?.content?.trim()
    return t?.length ? t : text
  } catch {
    return text
  }
}
