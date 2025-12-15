import { getRequestConfig } from 'next-intl/server'

export const locales = ['tr', 'en'] as const
export const defaultLocale = 'tr'

export default getRequestConfig(async ({ locale }) => ({
  locales,
  defaultLocale,
  messages: (await import(`./src/i18n/messages/${locale}.json`)).default,
}))