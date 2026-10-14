// Blog için tarayıcı ve sunucunun ortak kullandığı tipler ve yardımcılar (veritabanı bağımlılığı yok).

export interface BlogPostDto {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string | null
  coverImageAlt: string | null
  category: string
  tags: string[]
  author: string
  published: boolean
  publishedAt: string | null
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
  updatedAt: string
}

export type BlogListItem = Omit<BlogPostDto, 'content'>

export const BLOG_LIMITS = {
  title: 200,
  slug: 120,
  excerpt: 400,
  category: 60,
  tag: 40,
  tags: 20,
  author: 80,
  metaTitle: 70,
  metaDescription: 200,
  altText: 200,
  content: 400_000,
} as const

// Önerilen SEO uzunlukları (arama sonucunda kesilmemesi için)
export const SEO_RECOMMENDED = { title: 60, description: 160 } as const

const TR_MAP: Record<string, string> = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', I: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
}

// "Pet Taksi ile Güvenli Seyahat!" -> "pet-taksi-ile-guvenli-seyahat"
export function slugify(input: string): string {
  return input
    .replace(/[çÇğĞıİIöÖşŞüÜ]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, BLOG_LIMITS.slug)
    .replace(/-+$/g, '')
}

export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && slug.length >= 2 && slug.length <= BLOG_LIMITS.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

// HTML etiketlerini ve boşlukları atıp düz metin uzunluğu/boşluk kontrolü için kullanılır.
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}
