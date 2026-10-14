import prisma from '@/lib/prisma'
import { mockGalleryImages } from '@/lib/mock-data'

// Galeri tablosunu gerekirse oluşturur (şema değişikliği canlıda otomatik uygulanmadığı için).
// Tablo ilk kez oluşturulduğunda sitede görünen örnek resimler satır olarak eklenir; böylece
// yönetim panelinden sıralanabilir ve silinebilirler.
let ready: Promise<void> | null = null

async function init(): Promise<void> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`SELECT to_regclass('public.gallery_items') IS NOT NULL AS "exists"`
  if (rows[0]?.exists === true) return

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "gallery_items" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "url" TEXT NOT NULL,
      "title" TEXT,
      "description" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  if ((await prisma.galleryItem.count()) === 0) {
    await prisma.galleryItem.createMany({
      data: mockGalleryImages.map((img, index) => ({
        url: img.url,
        title: img.title ?? null,
        description: img.description ?? null,
        sortOrder: index,
      })),
    })
  }
}

export function ensureGalleryTable(): Promise<void> {
  if (!ready) {
    ready = init().catch((error) => {
      ready = null
      throw error
    })
  }
  return ready
}

// Yalnızca https adresleri ya da sunucudaki /uploads/ yolları kabul edilir.
export function isValidGalleryUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 1000) return false
  if (value.startsWith('/uploads/')) return true
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.replace(/[<>]/g, '').trim().slice(0, max)
  return text.length > 0 ? text : null
}
