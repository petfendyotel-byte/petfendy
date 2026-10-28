import type { Metadata } from 'next'

/**
 * Canonical scheme
 * ----------------
 * Turkish and English both keep a locale prefix (`/tr/...`, `/en/...`).
 * The marketing homepage is `/tr/home` (and `/en/home`). `/tr` is the account
 * screen, not the homepage, so `/` redirects to `/tr/home`.
 * Unprefixed paths (`/hizmetler`, `/booking/hotel`) are duplicates of the
 * Turkish pages and redirect to `/tr/...`. x-default is Turkish.
 * www and http are canonicalized to https://petfendy.com when the request
 * reaches the app. Vercel may redirect those hosts before the app runs.
 */

export const SITE_URL = 'https://petfendy.com'
export const CANONICAL_HOST = 'petfendy.com'
export const LOCALES = ['tr', 'en'] as const
export const DEFAULT_LOCALE = 'tr'
export const PATHNAME_HEADER = 'x-pathname'

export type Locale = (typeof LOCALES)[number]
export type ChangeFrequency = 'daily' | 'weekly' | 'monthly'

export type SitemapPage = {
  path: string
  priority: number
  changeFreq: ChangeFrequency
}

/** Indexable pages. Paths are locale suffixes; '' is the account screen. */
export const PUBLIC_SITEMAP_PAGES: SitemapPage[] = [
  { path: 'home', priority: 1, changeFreq: 'daily' },
  { path: '', priority: 0.3, changeFreq: 'weekly' },
  { path: 'ankara-pet-taksi', priority: 0.95, changeFreq: 'weekly' },
  { path: 'ankara-pet-otel', priority: 0.95, changeFreq: 'weekly' },
  { path: 'ankara-pet-kres', priority: 0.9, changeFreq: 'weekly' },
  { path: 'istanbul-pet-otel', priority: 0.8, changeFreq: 'weekly' },
  { path: 'booking/hotel', priority: 0.95, changeFreq: 'daily' },
  { path: 'booking/taxi', priority: 0.95, changeFreq: 'daily' },
  { path: 'booking/daycare', priority: 0.95, changeFreq: 'daily' },
  { path: 'hakkimda', priority: 0.8, changeFreq: 'weekly' },
  { path: 'hizmetler', priority: 0.85, changeFreq: 'weekly' },
  { path: 'iletisim', priority: 0.8, changeFreq: 'weekly' },
  { path: 'galeri', priority: 0.7, changeFreq: 'weekly' },
  { path: 'blog', priority: 0.7, changeFreq: 'weekly' },
  { path: 'sss', priority: 0.7, changeFreq: 'weekly' },
  { path: 'gizlilik-politikasi', priority: 0.5, changeFreq: 'monthly' },
  { path: 'sartlar-kosullar', priority: 0.5, changeFreq: 'monthly' },
  { path: 'mesafeli-satis-politikasi', priority: 0.5, changeFreq: 'monthly' },
  { path: 'mesafeli-satis-sozlesmesi', priority: 0.5, changeFreq: 'monthly' },
  { path: 'iptal-iade-politikasi', priority: 0.5, changeFreq: 'monthly' },
  { path: 'cerez-politikasi', priority: 0.5, changeFreq: 'monthly' },
  { path: 'cerez', priority: 0.5, changeFreq: 'monthly' },
  { path: 'on-bilgilendirme-formu', priority: 0.5, changeFreq: 'monthly' },
  { path: 'teslimat-ve-iade', priority: 0.5, changeFreq: 'monthly' },
  { path: 'odeme-guvenligi', priority: 0.5, changeFreq: 'monthly' },
  { path: 'veri-guvenligi', priority: 0.5, changeFreq: 'monthly' },
]

export function normalizePathname(pathname: string): string {
  let path = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (path.length > 1) path = path.replace(/\/+$/, '')
  return path
}

export function hasLocalePrefix(pathname: string): boolean {
  const path = normalizePathname(pathname)
  return LOCALES.some((locale) => path === `/${locale}` || path.startsWith(`/${locale}/`))
}

/** Public pathname this request should live at. Already-prefixed paths stay. */
export function toCanonicalPathname(pathname: string): string {
  const normalized = normalizePathname(pathname)
  if (normalized === '/') return `/${DEFAULT_LOCALE}/home`
  if (hasLocalePrefix(normalized)) return normalized
  return `/${DEFAULT_LOCALE}${normalized}`
}

export function pathSuffixFromPathname(pathname: string): string {
  const normalized = normalizePathname(pathname)
  const withoutLocale = normalized.replace(/^\/(tr|en)(?=\/|$)/, '')
  return withoutLocale.replace(/^\/+/, '')
}

export function localizedPath(locale: string, pathSuffix: string): string {
  const clean = pathSuffix.replace(/^\/+|\/+$/g, '')
  return clean ? `/${locale}/${clean}` : `/${locale}`
}

export function absoluteUrl(pathname: string): string {
  if (pathname.startsWith('http://') || pathname.startsWith('https://')) return pathname
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${SITE_URL}${path}`
}

/** hreflang map. x-default is the Turkish URL. */
export function languageAlternates(pathSuffix: string): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const locale of LOCALES) {
    languages[locale] = absoluteUrl(localizedPath(locale, pathSuffix))
  }
  languages['x-default'] = absoluteUrl(localizedPath(DEFAULT_LOCALE, pathSuffix))
  return languages
}

export function isNoIndexPath(pathname: string): boolean {
  return /\/checkout(\/|$)/.test(normalizePathname(pathname))
}

/**
 * Absolute URL to 308 to, or null when the request is already canonical.
 * Production hosts (petfendy.com / www) are pinned to https://petfendy.com.
 * Any other host (localhost, preview) only fixes the path.
 */
export function canonicalRedirectTarget(input: {
  host: string
  protocol: string
  pathname: string
  search?: string
}): string | null {
  const firstHost = input.host.split(',')[0].trim()
  const hostname = firstHost.replace(/:\d+$/, '')
  const protocol = input.protocol.replace(/:$/, '').toLowerCase() || 'https'
  const path = toCanonicalPathname(input.pathname)
  const search = input.search ?? ''
  const onProduction = hostname === CANONICAL_HOST || hostname === `www.${CANONICAL_HOST}`

  const nextProtocol = onProduction ? 'https' : protocol
  const nextHost = onProduction ? CANONICAL_HOST : firstHost
  const pathChanged = path !== normalizePathname(input.pathname)
  const hostChanged = onProduction && (hostname !== CANONICAL_HOST || protocol !== 'https')

  if (!pathChanged && !hostChanged) return null
  if (!nextHost) return null
  return `${nextProtocol}://${nextHost}${path}${search}`
}

export function pageAlternates(locale: string, pathSuffix: string) {
  return {
    canonical: absoluteUrl(localizedPath(locale, pathSuffix)),
    languages: languageAlternates(pathSuffix),
  }
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

// Sayfa bazlı metadata: kendi canonical adresi, hreflang, başlık ve açıklama.
export function pageMetadata(locale: string, path: string, title: string, description: string): Metadata {
  const canonical = absoluteUrl(localizedPath(locale, path))
  const ogLocale = locale === 'en' ? 'en_US' : 'tr_TR'
  return {
    title,
    description,
    alternates: pageAlternates(locale, path),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: ogLocale,
      alternateLocale: locale === 'en' ? 'tr_TR' : 'en_US',
      siteName: 'Petfendy - Ankara Pet Otel',
      url: canonical,
      images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Petfendy - Ankara Pet Otel, Pet Taksi ve Pet Kreş' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}
