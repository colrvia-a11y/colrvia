// OG image text utilities
// Normalizes and composes title/subtitle for OG rendering.

export interface BuildOgTextOptions {
  title?: string | null | undefined
  subtitle?: string | null | undefined
  maxTitleLength?: number
  maxSubtitleLength?: number
  fallbackTitle?: string
  fallbackSubtitle?: string
  ellipsis?: string
}

const defaultOptions: Required<Pick<BuildOgTextOptions, 'maxTitleLength' | 'maxSubtitleLength' | 'fallbackTitle' | 'fallbackSubtitle' | 'ellipsis'>> = {
  maxTitleLength: 140,
  maxSubtitleLength: 160,
  fallbackTitle: 'Colrvia Story',
  fallbackSubtitle: '',
  ellipsis: '…',
}

export interface OgTextResult {
  title: string
  subtitle: string
}

export function buildOgText(opts: BuildOgTextOptions = {}): OgTextResult {
  const {
    title, subtitle,
    maxTitleLength,
    maxSubtitleLength,
    fallbackTitle,
    fallbackSubtitle,
    ellipsis,
  } = { ...defaultOptions, ...opts }

  function norm(value: string | null | undefined, fallback: string, max: number): string {
    let v = (value ?? '').toString().trim()
    if (!v) v = fallback
    if (v.length > max) {
      const sliceLen = Math.max(0, max - ellipsis.length)
      v = v.slice(0, sliceLen).trimEnd() + ellipsis
    }
    return v
  }

  return {
    title: norm(title, fallbackTitle, maxTitleLength),
    subtitle: norm(subtitle, fallbackSubtitle, maxSubtitleLength),
  }
}
