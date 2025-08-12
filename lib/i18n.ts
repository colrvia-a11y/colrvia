import { headers } from 'next/headers'

export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export function getLocale(): Locale {
  try {
    const header = headers().get('accept-language')
    if (header) {
      const languages = header.split(',').map(part => part.split(';')[0].trim())
      for (const lang of languages) {
        const base = lang.toLowerCase().split('-')[0]
        if (locales.includes(base as Locale)) return base as Locale
      }
    }
  } catch {
    // headers() not available (e.g., during tests)
  }
  return defaultLocale
}

export async function getMessages(locale: Locale) {
  try {
    return (await import(`../messages/${locale}.json`)).default
  } catch {
    return (await import(`../messages/${defaultLocale}.json`)).default
  }
}
