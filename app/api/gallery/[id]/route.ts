import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, logSecurityEvent } from '@/lib/auth-middleware'
import { ensureGalleryTable, cleanText } from '@/lib/gallery-db'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

// PATCH - Başlık/açıklama güncelle (yalnızca admin)
export const PATCH = requireAdmin(async (request: NextRequest, user, context?: Ctx) => {
  try {
    const { id } = await context!.params
    const body = await request.json()
    await ensureGalleryTable()
    const item = await prisma.galleryItem.update({
      where: { id },
      data: { title: cleanText(body?.title, 120), description: cleanText(body?.description, 300) },
    })
    logSecurityEvent({ type: 'GALLERY_IMAGE_UPDATED', userId: user.userId, details: { id } })
    return NextResponse.json({ id: item.id, title: item.title ?? undefined, description: item.description ?? undefined })
  } catch (error) {
    console.error('Gallery update error:', error)
    return NextResponse.json({ error: 'Resim güncellenemedi' }, { status: 500 })
  }
}, { waf: false })

// DELETE - Resmi galeriden kaldır (yalnızca admin). Dosya depoda silinmez, başka yerlerde kullanılıyor olabilir.
export const DELETE = requireAdmin(async (_request: NextRequest, user, context?: Ctx) => {
  try {
    const { id } = await context!.params
    await ensureGalleryTable()
    await prisma.galleryItem.delete({ where: { id } })
    logSecurityEvent({ type: 'GALLERY_IMAGE_DELETED', userId: user.userId, details: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Gallery delete error:', error)
    return NextResponse.json({ error: 'Resim silinemedi' }, { status: 500 })
  }
})
