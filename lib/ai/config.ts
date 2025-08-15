export const REALTIME_MODEL =
  process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-mini'

export const REALTIME_TTS_MODEL =
  process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-mini-tts'

export const AI_MODEL =
  process.env.OPENAI_MODEL || 'gpt-4o'

// Palette generation model for LLM-assisted picks.
// Prefer VIA_PALETTE_MODEL; fallback to OPENAI_MODEL; default to gpt-5.
export const PALETTE_MODEL =
  process.env.VIA_PALETTE_MODEL || process.env.OPENAI_MODEL || 'gpt-5'

export const VISION_MODEL =
  process.env.OPENAI_VISION_MODEL || 'gpt-4o'

export const AI_ENABLE = process.env.AI_ENABLE === 'true'
export const AI_MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 300)
export const HAS_OPENAI_KEY = !!process.env.OPENAI_API_KEY
