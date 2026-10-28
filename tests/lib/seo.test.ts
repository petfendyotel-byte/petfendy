import { describe, expect, it } from 'vitest'
import {
  canonicalRedirectTarget,
  languageAlternates,
  pageMetadata,
  toCanonicalPathname,
} from '@/lib/seo'

describe('canonical pathnames', () => {
  it('sends the root to the Turkish marketing homepage, not the account screen', () => {
    expect(toCanonicalPathname('/')).toBe('/tr/home')
    expect(toCanonicalPathname('/tr')).toBe('/tr')
    expect(toCanonicalPathname('/en')).toBe('/en')
  })

  it('prefixes unprefixed duplicates with /tr and leaves locale URLs alone', () => {
    expect(toCanonicalPathname('/booking/hotel')).toBe('/tr/booking/hotel')
    expect(toCanonicalPathname('/hizmetler/')).toBe('/tr/hizmetler')
    expect(toCanonicalPathname('/tr/hizmetler')).toBe('/tr/hizmetler')
    expect(toCanonicalPathname('/en/blog/pet-otel')).toBe('/en/blog/pet-otel')
    expect(toCanonicalPathname('/tr/home/')).toBe('/tr/home')
  })
})

describe('canonicalRedirectTarget', () => {
  it('308 target for production host, protocol, and path in one hop', () => {
    expect(canonicalRedirectTarget({
      host: 'petfendy.com',
      protocol: 'https',
      pathname: '/',
    })).toBe('https://petfendy.com/tr/home')

    expect(canonicalRedirectTarget({
      host: 'www.petfendy.com',
      protocol: 'https',
      pathname: '/booking/hotel',
      search: '?ref=ads',
    })).toBe('https://petfendy.com/tr/booking/hotel?ref=ads')

    expect(canonicalRedirectTarget({
      host: 'petfendy.com',
      protocol: 'http',
      pathname: '/tr/iletisim',
    })).toBe('https://petfendy.com/tr/iletisim')
  })

  it('does not redirect an already canonical production URL', () => {
    expect(canonicalRedirectTarget({
      host: 'petfendy.com',
      protocol: 'https',
      pathname: '/en/home',
    })).toBeNull()
  })

  it('only fixes the path on non-production hosts', () => {
    expect(canonicalRedirectTarget({
      host: 'localhost:3000',
      protocol: 'http',
      pathname: '/hizmetler',
    })).toBe('http://localhost:3000/tr/hizmetler')

    expect(canonicalRedirectTarget({
      host: 'localhost:3000',
      protocol: 'http',
      pathname: '/tr/home',
    })).toBeNull()
  })
})

describe('hreflang', () => {
  it('points x-default at the Turkish URL', () => {
    expect(languageAlternates('home')).toEqual({
      tr: 'https://petfendy.com/tr/home',
      en: 'https://petfendy.com/en/home',
      'x-default': 'https://petfendy.com/tr/home',
    })
    expect(languageAlternates('blog/ankara')).toEqual({
      tr: 'https://petfendy.com/tr/blog/ankara',
      en: 'https://petfendy.com/en/blog/ankara',
      'x-default': 'https://petfendy.com/tr/blog/ankara',
    })
  })

  it('page metadata uses an absolute canonical and og:url', () => {
    const meta = pageMetadata('tr', 'hizmetler', 'Hizmetler', 'Açıklama')
    expect(meta.alternates?.canonical).toBe('https://petfendy.com/tr/hizmetler')
    expect(meta.alternates?.languages).toMatchObject({
      tr: 'https://petfendy.com/tr/hizmetler',
      en: 'https://petfendy.com/en/hizmetler',
      'x-default': 'https://petfendy.com/tr/hizmetler',
    })
    expect(meta.openGraph?.url).toBe('https://petfendy.com/tr/hizmetler')
  })
})
