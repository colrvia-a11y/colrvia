export const MODELS = {
  CHAT: process.env.VIA_CHAT_MODEL || "gpt-5",
  CHAT_FAST: process.env.VIA_CHAT_FAST_MODEL || "gpt-5-mini",
} as const;

export const AI = {
  ENABLED: process.env.AI_ENABLE === "true",
  MAX_OUTPUT_TOKENS: Number(process.env.AI_MAX_OUTPUT_TOKENS || 300),
};

export const REALTIME_MODEL =
  process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-mini';

export const REALTIME_TTS_MODEL =
  process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-mini-tts';

export const AI_MODEL =
  process.env.OPENAI_MODEL || 'gpt-4o';

export const VIA_CHAT_MODEL = MODELS.CHAT;
export const VIA_CHAT_FAST_MODEL = MODELS.CHAT_FAST;

export const VIA_INTERVIEW_MODEL =
  process.env.VIA_INTERVIEW_MODEL || 'gpt-5-mini';

export const PALETTE_MODEL =
  process.env.VIA_PALETTE_MODEL || process.env.OPENAI_MODEL || 'gpt-5';

export const VISION_MODEL =
  process.env.OPENAI_VISION_MODEL || 'gpt-4o';

export const AI_ENABLE = AI.ENABLED;
export const AI_MAX_OUTPUT_TOKENS = AI.MAX_OUTPUT_TOKENS;
export const HAS_OPENAI_KEY = !!process.env.OPENAI_API_KEY;
