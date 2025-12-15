const { getRequestConfig } = require('next-intl/server')

const locales = ['tr', 'en']
const defaultLocale = 'tr'

module.exports = getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locales.includes(locale) ? locale : defaultLocale

  return {
    locales,
    defaultLocale,
    messages: (await import(`./src/i18n/messages/${resolvedLocale}.json`)).default,
    locale: resolvedLocale,
  }
})

module.exports.locales = locales
module.exports.defaultLocale = defaultLocale