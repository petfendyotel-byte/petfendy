import { getRequestConfig } from 'next-intl/server'

export const locales = ['tr', 'en'] as const
export const defaultLocale = 'tr'

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locales.includes(locale as any) ? locale : defaultLocale

  return {
    locales,
    defaultLocale,
    messages: (await import(`./src/i18n/messages/${resolvedLocale}.json`)).default,
    locale: resolvedLocale,
  }
})