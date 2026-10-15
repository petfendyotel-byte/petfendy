import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@/lib/prisma'
import { requireAdmin, logSecurityEvent } from '@/lib/auth-middleware'
import { isS3Configured, uploadToS3, S3_PUBLIC_URL } from '@/lib/s3'
import { ensureGalleryTable } from '@/lib/gallery-db'
import { ensureBlogTable } from '@/lib/blog-db'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// Dış kaynaktan (ör. Unsplash) kopyalanacak resimler yalnızca bu sunuculardan indirilir (SSRF'ye karşı izin listesi).
const ALLOWED_HOSTS = new Set(['images.unsplash.com'])
const MAX_BYTES = 10 * 1024 * 1024
const EXTENSIONS: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' }

// MinIO/depo dışındaki, tam adresli resimler "dış kaynaklı" sayılır.
const isExternal = (url: string | null | undefined): url is string =>
  !!url && /^https?:\/\//i.test(url) && !url.startsWith(S3_PUBLIC_URL)

async function copyToStorage(url: string): Promise<string> {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(`İzin verilmeyen kaynak: ${parsed.hostname}`)
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000), redirect: 'error' })
  if (!response.ok) throw new Error(`İndirilemedi (HTTP ${response.status})`)
  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
  const extension = EXTENSIONS[contentType]
  if (!extension) throw new Error(`Desteklenmeyen dosya türü: ${contentType || 'bilinmiyor'}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length === 0 || buffer.length > MAX_BYTES) throw new Error('Dosya boş ya da 10MB\'tan büyük')
  return uploadToS3(buffer, `uploads/images/migrated-${Date.now()}-${uuidv4()}${extension}`, contentType)
}

async function collect() {
  await Promise.all([ensureGalleryTable(), ensureBlogTable()])
  const [gallery, blog, rooms] = await Promise.all([
    prisma.galleryItem.findMany({ select: { id: true, url: true } }),
    prisma.blogArticle.findMany({ select: { id: true, coverImage: true } }),
    prisma.roomImage.findMany({ select: { id: true, url: true } }),
  ])
  return {
    gallery: gallery.filter((row) => isExternal(row.url)),
    blog: blog.filter((row) => isExternal(row.coverImage)),
    rooms: rooms.filter((row) => isExternal(row.url)),
  }
}

// GET - Kaç resim dış kaynakta (yalnızca admin)
export const GET = requireAdmin(async () => {
  try {
    const found = await collect()
    return NextResponse.json({
      gallery: found.gallery.length,
      blog: found.blog.length,
      rooms: found.rooms.length,
      total: found.gallery.length + found.blog.length + found.rooms.length,
      storageReady: isS3Configured(),
    })
  } catch (error) {
    console.error('Migrate images count error:', error)
    return NextResponse.json({ error: 'Sayım yapılamadı' }, { status: 500 })
  }
})

// POST - Dış kaynaklı resimleri MinIO'ya kopyalayıp veritabanındaki adresleri günceller (yalnızca admin)
export const POST = requireAdmin(async (_request: NextRequest, user) => {
  try {
    if (!isS3Configured()) {
      return NextResponse.json({ error: 'MinIO yapılandırılmamış' }, { status: 503 })
    }
    const found = await collect()
    const urls = Array.from(new Set([
      ...found.gallery.map((row) => row.url),
      ...found.blog.map((row) => row.coverImage as string),
      ...found.rooms.map((row) => row.url),
    ]))

    const copied = new Map<string, string>()
    const failed: { url: string; error: string }[] = []
    for (const url of urls) {
      try {
        copied.set(url, await copyToStorage(url))
      } catch (error) {
        failed.push({ url: url.slice(0, 120), error: error instanceof Error ? error.message : 'Bilinmeyen hata' })
      }
    }

    let updated = 0
    for (const row of found.gallery) {
      const next = copied.get(row.url)
      if (next) { await prisma.galleryItem.update({ where: { id: row.id }, data: { url: next } }); updated++ }
    }
    for (const row of found.blog) {
      const next = copied.get(row.coverImage as string)
      if (next) { await prisma.blogArticle.update({ where: { id: row.id }, data: { coverImage: next } }); updated++ }
    }
    for (const row of found.rooms) {
      const next = copied.get(row.url)
      if (next) { await prisma.roomImage.update({ where: { id: row.id }, data: { url: next } }); updated++ }
    }

    logSecurityEvent({ type: 'IMAGES_MIGRATED_TO_STORAGE', userId: user.userId, details: { copied: copied.size, updated, failed: failed.length } })
    return NextResponse.json({ copied: copied.size, updated, failed })
  } catch (error) {
    console.error('Migrate images error:', error)
    return NextResponse.json({ error: 'Taşıma başarısız oldu' }, { status: 500 })
  }
})
