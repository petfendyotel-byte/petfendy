import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, logSecurityEvent } from '@/lib/auth-middleware'
import { ensureGalleryTable, isValidGalleryUrl, cleanText } from '@/lib/gallery-db'

export const dynamic = 'force-dynamic'

const toDto = (item: { id: string; url: string; title: string | null; description: string | null }) => ({
  id: item.id,
  url: item.url,
  title: item.title ?? undefined,
  description: item.description ?? undefined,
})

// GET - Galeri resimlerini sıralı listele (herkese açık)
export async function GET() {
  try {
    await ensureGalleryTable()
    const items = await prisma.galleryItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })
    return NextResponse.json({ images: items.map(toDto) })
  } catch (error) {
    console.error('Gallery list error:', error)
    return NextResponse.json({ error: 'Galeri yüklenemedi' }, { status: 500 })
  }
}

// POST - Resim ekle (yalnızca admin). Dosya önce /api/upload ile yüklenir, sonra adresi buraya kaydedilir.
export const POST = requireAdmin(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    if (!isValidGalleryUrl(body?.url)) {
      return NextResponse.json({ error: 'Geçersiz resim adresi' }, { status: 400 })
    }
    await ensureGalleryTable()
    const last = await prisma.galleryItem.findFirst({ orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } })
    const item = await prisma.galleryItem.create({
      data: {
        url: body.url,
        title: cleanText(body.title, 120),
        description: cleanText(body.description, 300),
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    })
    logSecurityEvent({ type: 'GALLERY_IMAGE_ADDED', userId: user.userId, details: { id: item.id } })
    return NextResponse.json(toDto(item), { status: 201 })
  } catch (error) {
    console.error('Gallery add error:', error)
    return NextResponse.json({ error: 'Resim eklenemedi' }, { status: 500 })
  }
})

// PUT - Sıralamayı kaydet (yalnızca admin). Gövde: { order: ["id1", "id2", ...] }
export const PUT = requireAdmin(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const order = body?.order
    if (!Array.isArray(order) || order.length === 0 || order.length > 500 || !order.every((id) => typeof id === 'string')) {
      return NextResponse.json({ error: 'Geçersiz sıralama' }, { status: 400 })
    }
    await ensureGalleryTable()
    await prisma.$transaction(
      (order as string[]).map((id, index) => prisma.galleryItem.update({ where: { id }, data: { sortOrder: index } }))
    )
    logSecurityEvent({ type: 'GALLERY_REORDERED', userId: user.userId, details: { count: order.length } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Gallery reorder error:', error)
    return NextResponse.json({ error: 'Sıralama kaydedilemedi' }, { status: 500 })
  }
})
