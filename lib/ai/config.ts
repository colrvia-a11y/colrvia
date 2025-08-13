export const AI_ENABLE = process.env.AI_ENABLE === 'true'
// Canonical: COLRVIA_LLM_MODEL. Fallbacks preserved for backward compatibility.
export const AI_MODEL =
	process.env.COLRVIA_LLM_MODEL ||
	process.env.AI_MODEL ||
	process.env.OPENAI_MODEL || // legacy
	'gpt-4o-mini'
export const AI_MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 300)
export const HAS_OPENAI_KEY = !!process.env.OPENAI_API_KEY
