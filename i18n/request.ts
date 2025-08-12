import {getRequestConfig} from 'next-intl/server'
import {defaultLocale, locales} from '../lib/i18n'

export default getRequestConfig(async ({requestLocale}) => {
  let locale = (await requestLocale) ?? defaultLocale
  if (!locales.includes(locale as typeof locales[number])) {
    locale = defaultLocale
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
