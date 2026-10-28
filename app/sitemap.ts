import { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog-db'
import {
  absoluteUrl,
  languageAlternates,
  LOCALES,
  localizedPath,
  PUBLIC_SITEMAP_PAGES,
} from '@/lib/seo'

// Blog yazıları yönetim panelinden değişir; site haritası her istekte güncel okunur.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Yalnızca canonical adresler: https://petfendy.com/{tr|en}/...
  // Kök URL (https://petfendy.com) /tr/home adresine yönlenir, listeye girmez.
  for (const page of PUBLIC_SITEMAP_PAGES) {
    for (const locale of LOCALES) {
      sitemapEntries.push({
        url: absoluteUrl(localizedPath(locale, page.path)),
        lastModified,
        changeFrequency: page.changeFreq,
        priority: page.priority,
        alternates: { languages: languageAlternates(page.path) },
      })
    }
  }

  // Yayındaki blog yazıları. Her dil kendi canonical adresidir; hreflang eşler.
  try {
    const posts = await getPublishedPosts()
    for (const post of posts) {
      const suffix = `blog/${post.slug}`
      for (const locale of LOCALES) {
        sitemapEntries.push({
          url: absoluteUrl(localizedPath(locale, suffix)),
          lastModified: new Date(post.updatedAt),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: { languages: languageAlternates(suffix) },
        })
      }
    }
  } catch (error) {
    console.error('Sitemap blog error:', error)
  }

  return sitemapEntries
}
