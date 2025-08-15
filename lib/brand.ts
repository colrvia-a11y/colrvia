export type CanonicalBrand = 'sherwin_williams' | 'behr'

/** Accepts user/UI variants and returns the DB-safe canonical code. Defaults to 'sherwin_williams'. */
export function normalizeBrand(input?: string | null): CanonicalBrand {
  const raw = (input ?? '').toString().trim().toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
  if (!raw) return 'sherwin_williams'
  // Common synonyms
  if (/(^|_)behr($|_)/.test(raw)) return 'behr'
  if (/(^|_)sw($|_)|sherwin(_|)williams|sherwinwilliams|sherwin/.test(raw)) return 'sherwin_williams'
  // Fallback
  return 'sherwin_williams'
}

export function prettyBrand(b: CanonicalBrand): string {
  return b === 'behr' ? 'Behr' : 'Sherwin-Williams'
}

