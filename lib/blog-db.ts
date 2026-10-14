import sanitizeHtml from 'sanitize-html'
import prisma from '@/lib/prisma'
import { mockBlogPosts } from '@/lib/mock-data'
import { BLOG_LIMITS, isValidSlug, slugify, stripHtml, type BlogListItem, type BlogPostDto } from '@/lib/blog-shared'

// Blog tablosunu gerekirse oluşturur (şema değişikliği canlıda otomatik uygulanmadığı için).
// Tablo ilk kez oluşturulduğunda sitede görünen örnek yazılar satır olarak eklenir; böylece
// yönetim panelinden düzenlenebilir ve silinebilirler.
let ready: Promise<void> | null = null

async function init(): Promise<void> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`SELECT to_regclass('public.blog_articles') IS NOT NULL AS "exists"`
  if (rows[0]?.exists === true) return

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "blog_articles" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "excerpt" TEXT NOT NULL DEFAULT '',
      "content" TEXT NOT NULL,
      "coverImage" TEXT,
      "coverImageAlt" TEXT,
      "category" TEXT NOT NULL DEFAULT 'Genel',
      "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "author" TEXT NOT NULL DEFAULT 'Petfendy Ekibi',
      "published" BOOLEAN NOT NULL DEFAULT false,
      "publishedAt" TIMESTAMP(3),
      "metaTitle" TEXT,
      "metaDescription" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "blog_articles_slug_key" ON "blog_articles"("slug")`)

  if ((await prisma.blogArticle.count()) === 0) {
    await prisma.blogArticle.createMany({
      data: mockBlogPosts.map((post) => ({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: sanitizeBlogHtml(post.content),
        coverImage: post.coverImage ?? null,
        category: post.category,
        tags: post.tags,
        author: post.author,
        published: post.published,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
      })),
    })
  }
}

export function ensureBlogTable(): Promise<void> {
  if (!ready) {
    ready = init().catch((error) => {
      ready = null
      throw error
    })
  }
  return ready
}

// ---- HTML temizleme (kaydederken ve gösterirken) ----
const ALLOWED_TAGS = [
  'h2', 'h3', 'h4', 'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'a',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      '*': ['style'],
    },
    allowedStyles: {
      '*': { 'text-align': [/^(left|right|center|justify)$/] },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
          ...(attribs.target === '_blank' ? { target: '_blank' } : {}),
        },
      }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
    },
  })
}

// ---- Dönüştürücüler ----
type Row = Awaited<ReturnType<typeof prisma.blogArticle.findMany>>[number]

export function toDto(row: Row): BlogPostDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.coverImage,
    coverImageAlt: row.coverImageAlt,
    category: row.category,
    tags: row.tags,
    author: row.author,
    published: row.published,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function toListItem(row: Row): BlogListItem {
  const { content: _content, ...rest } = toDto(row)
  return rest
}

// ---- Herkese açık okuma (sunucu bileşenleri ve API) ----
const publicWhere = () => ({ published: true, OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] })

export async function getPublishedPosts(): Promise<BlogListItem[]> {
  await ensureBlogTable()
  const rows = await prisma.blogArticle.findMany({
    where: publicWhere(),
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  })
  return rows.map(toListItem)
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPostDto | null> {
  await ensureBlogTable()
  const row = await prisma.blogArticle.findFirst({ where: { slug, ...publicWhere() } })
  return row ? toDto(row) : null
}

export async function getRelatedPosts(post: { id: string; category: string }, limit = 3): Promise<BlogListItem[]> {
  await ensureBlogTable()
  const rows = await prisma.blogArticle.findMany({
    where: { ...publicWhere(), id: { not: post.id }, category: post.category },
    orderBy: [{ publishedAt: 'desc' }],
    take: limit,
  })
  return rows.map(toListItem)
}

// ---- Doğrulama (oluşturma ve güncelleme) ----
export interface BlogInput {
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
  publishedAt: Date | null
  metaTitle: string | null
  metaDescription: string | null
}

const clean = (value: unknown, max: number): string => (typeof value === 'string' ? value.replace(/[<>]/g, '').trim().slice(0, max) : '')
const cleanOrNull = (value: unknown, max: number): string | null => clean(value, max) || null

function isValidImageUrl(value: string): boolean {
  if (value.startsWith('/uploads/')) return true
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function parseBlogInput(body: any): { ok: true; data: BlogInput } | { ok: false; error: string } {
  const title = clean(body?.title, BLOG_LIMITS.title)
  if (title.length < 3) return { ok: false, error: 'Başlık en az 3 karakter olmalı' }

  const slug = typeof body?.slug === 'string' && body.slug.trim() ? body.slug.trim().toLowerCase() : slugify(title)
  if (!isValidSlug(slug)) return { ok: false, error: 'Adres (slug) yalnızca küçük harf, rakam ve tire içermeli' }

  const rawContent = typeof body?.content === 'string' ? body.content : ''
  if (rawContent.length > BLOG_LIMITS.content) return { ok: false, error: 'İçerik çok uzun' }
  const content = sanitizeBlogHtml(rawContent)
  if (stripHtml(content).length === 0 && !/<img\b/i.test(content)) return { ok: false, error: 'İçerik boş olamaz' }

  const coverImage = cleanOrNull(body?.coverImage, 1000)
  if (coverImage && !isValidImageUrl(coverImage)) return { ok: false, error: 'Öne çıkan görsel adresi geçersiz' }

  const tags = Array.isArray(body?.tags)
    ? Array.from(new Set(body.tags.map((t: unknown) => clean(t, BLOG_LIMITS.tag)).filter(Boolean))).slice(0, BLOG_LIMITS.tags) as string[]
    : []

  const published = body?.published === true
  let publishedAt: Date | null = null
  if (typeof body?.publishedAt === 'string' && body.publishedAt) {
    const parsed = new Date(body.publishedAt)
    if (Number.isNaN(parsed.getTime())) return { ok: false, error: 'Yayın tarihi geçersiz' }
    publishedAt = parsed
  }
  if (published && !publishedAt) publishedAt = new Date()

  return {
    ok: true,
    data: {
      title,
      slug,
      excerpt: clean(body?.excerpt, BLOG_LIMITS.excerpt),
      content,
      coverImage,
      coverImageAlt: cleanOrNull(body?.coverImageAlt, BLOG_LIMITS.altText),
      category: clean(body?.category, BLOG_LIMITS.category) || 'Genel',
      tags,
      author: clean(body?.author, BLOG_LIMITS.author) || 'Petfendy Ekibi',
      published,
      publishedAt,
      metaTitle: cleanOrNull(body?.metaTitle, BLOG_LIMITS.metaTitle),
      metaDescription: cleanOrNull(body?.metaDescription, BLOG_LIMITS.metaDescription),
    },
  }
}
