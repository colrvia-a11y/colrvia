export const REALTIME_MODEL =
  process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-mini'

export const REALTIME_TTS_MODEL =
  process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-mini-tts'

export const AI_MODEL =
  process.env.OPENAI_MODEL || 'gpt-4o'

// —— Via model map (env-configurable with safe defaults) ——
// 1) Via (chat bot): long/complex turns
export const VIA_CHAT_MODEL =
  process.env.VIA_CHAT_MODEL || 'gpt-5'
//    Via (chat bot): quick, low-stakes turns
export const VIA_CHAT_FAST_MODEL =
  process.env.VIA_CHAT_FAST_MODEL || 'gpt-5-mini'

// 2) Interview helper (explainers / clarifications during intake)
export const VIA_INTERVIEW_MODEL =
  process.env.VIA_INTERVIEW_MODEL || 'gpt-5-mini'

// 3) Palette generation (deep reasoning over catalog + formula)
export const PALETTE_MODEL =
  process.env.VIA_PALETTE_MODEL || process.env.OPENAI_MODEL || 'gpt-5'

export const VISION_MODEL =
  process.env.OPENAI_VISION_MODEL || 'gpt-4o'

export const AI_ENABLE = process.env.AI_ENABLE === 'true'
export const AI_MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 300)
export const HAS_OPENAI_KEY = !!process.env.OPENAI_API_KEY

export const MODELS = {
  CHAT: process.env.VIA_CHAT_MODEL || 'gpt-5-mini',
  PALETTE: process.env.VIA_PALETTE_MODEL || 'gpt-5',
  REALTIME: process.env.VIA_REALTIME_MODEL || 'gpt-4o-realtime-preview',
} as const;
