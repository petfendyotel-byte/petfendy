import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, logSecurityEvent } from '@/lib/auth-middleware'
import { ensureBlogTable, parseBlogInput, toDto } from '@/lib/blog-db'

export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

// GET - Tek yazı, içerikle birlikte (yalnızca admin; düzenleme ekranı için)
export const GET = requireAdmin(async (_request: NextRequest, _user, context?: Ctx) => {
  try {
    const { id } = await context!.params
    await ensureBlogTable()
    const row = await prisma.blogArticle.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ error: 'Yazı bulunamadı' }, { status: 404 })
    return NextResponse.json(toDto(row))
  } catch (error) {
    console.error('Blog get error:', error)
    return NextResponse.json({ error: 'Yazı yüklenemedi' }, { status: 500 })
  }
})

// PUT - Yazıyı güncelle (yalnızca admin). HTML sunucuda temizlenir.
export const PUT = requireAdmin(
  async (request: NextRequest, user, context?: Ctx) => {
    try {
      const { id } = await context!.params
      const parsed = parseBlogInput(await request.json())
      if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

      await ensureBlogTable()
      const existing = await prisma.blogArticle.findUnique({ where: { id }, select: { id: true } })
      if (!existing) return NextResponse.json({ error: 'Yazı bulunamadı' }, { status: 404 })

      const clash = await prisma.blogArticle.findFirst({ where: { slug: parsed.data.slug, id: { not: id } }, select: { id: true } })
      if (clash) return NextResponse.json({ error: 'Bu adres (slug) başka bir yazıda kullanılıyor' }, { status: 409 })

      const row = await prisma.blogArticle.update({ where: { id }, data: parsed.data })
      logSecurityEvent({ type: 'BLOG_POST_UPDATED', userId: user.userId, details: { id, slug: row.slug } })
      return NextResponse.json(toDto(row))
    } catch (error) {
      console.error('Blog update error:', error)
      return NextResponse.json({ error: 'Yazı güncellenemedi' }, { status: 500 })
    }
  },
  { waf: false }
)

// DELETE - Yazıyı sil (yalnızca admin)
export const DELETE = requireAdmin(async (_request: NextRequest, user, context?: Ctx) => {
  try {
    const { id } = await context!.params
    await ensureBlogTable()
    await prisma.blogArticle.delete({ where: { id } })
    logSecurityEvent({ type: 'BLOG_POST_DELETED', userId: user.userId, details: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Blog delete error:', error)
    return NextResponse.json({ error: 'Yazı silinemedi' }, { status: 500 })
  }
})
