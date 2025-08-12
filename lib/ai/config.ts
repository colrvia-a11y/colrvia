export const AI_ENABLE = process.env.AI_ENABLE === 'true'
export const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini'
export const AI_MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 300)
export const HAS_OPENAI_KEY = !!process.env.OPENAI_API_KEY
