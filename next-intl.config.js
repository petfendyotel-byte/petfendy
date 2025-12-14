const { getRequestConfig } = require('next-intl/server')

const locales = ['tr', 'en']
const defaultLocale = 'tr'

module.exports = getRequestConfig(async ({ locale }) => ({
  locales,
  defaultLocale,
  messages: (await import(`./i18n/messages/${locale}.json`)).default,
}))

module.exports.locales = locales
module.exports.defaultLocale = defaultLocale

