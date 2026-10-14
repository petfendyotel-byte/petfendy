import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { optionalAuth, requireAdmin, logSecurityEvent } from '@/lib/auth-middleware'
import { ensureBlogTable, getPublishedPosts, parseBlogInput, toDto, toListItem } from '@/lib/blog-db'

export const dynamic = 'force-dynamic'

// GET - Yazı listesi. Herkese yayında olanlar; admin için ?all=1 ile taslaklar da (içeriksiz özet).
export async function GET(request: NextRequest) {
  try {
    const wantsAll = new URL(request.url).searchParams.get('all') === '1'
    if (wantsAll) {
      const user = await optionalAuth(request)
      if (user?.role === 'admin') {
        await ensureBlogTable()
        const rows = await prisma.blogArticle.findMany({ orderBy: [{ createdAt: 'desc' }] })
        return NextResponse.json({ posts: rows.map(toListItem) })
      }
    }
    return NextResponse.json({ posts: await getPublishedPosts() })
  } catch (error) {
    console.error('Blog list error:', error)
    return NextResponse.json({ error: 'Yazılar yüklenemedi' }, { status: 500 })
  }
}

// POST - Yeni yazı (yalnızca admin). İçerik HTML olduğu için WAF gövde taraması kapalı; HTML sunucuda temizlenir.
export const POST = requireAdmin(
  async (request: NextRequest, user) => {
    try {
      const parsed = parseBlogInput(await request.json())
      if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

      await ensureBlogTable()
      if (await prisma.blogArticle.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } })) {
        return NextResponse.json({ error: 'Bu adres (slug) başka bir yazıda kullanılıyor' }, { status: 409 })
      }
      const row = await prisma.blogArticle.create({ data: parsed.data })
      logSecurityEvent({ type: 'BLOG_POST_CREATED', userId: user.userId, details: { id: row.id, slug: row.slug } })
      return NextResponse.json(toDto(row), { status: 201 })
    } catch (error) {
      console.error('Blog create error:', error)
      return NextResponse.json({ error: 'Yazı kaydedilemedi' }, { status: 500 })
    }
  },
  { waf: false }
)
