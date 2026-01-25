import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, validateInput, sanitizeInputData, logSecurityEvent, optionalAuth } from '@/lib/auth-middleware'
import { sanitizeInput } from '@/lib/security'

// Page validation schema
const pageSchema = {
  title: { required: true, type: 'string', minLength: 2, maxLength: 200 },
  slug: { required: true, type: 'string', minLength: 2, maxLength: 100 },
  content: { required: true, type: 'string', minLength: 10 },
  excerpt: { type: 'string', maxLength: 500 },
  metaTitle: { type: 'string', maxLength: 60 },
  metaDescription: { type: 'string', maxLength: 160 },
  heroImage: { type: 'string' },
  published: { type: 'boolean' },
  showInMenu: { type: 'boolean' },
  menuOrder: { type: 'number', min: 0, max: 100 },
  parentSlug: { type: 'string' },
  pageType: { type: 'string' },
  customFields: { type: 'object' }
}

// GET - List all pages (public endpoint with optional auth for admin features)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const pageType = searchParams.get('type')
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'
    
    // Check if user is admin for unpublished content
    const user = await optionalAuth(request)
    const isAdmin = user?.role === 'admin'

    const prisma = (await import('@/lib/prisma')).default

    // Build where clause
    const where: any = {}
    
    // Only show published pages to non-admin users
    if (!isAdmin || published === 'true') {
      where.published = true
    } else if (published === 'false') {
      where.published = false
    }

    if (pageType) {
      where.pageType = pageType
    }

    const pages = await prisma.page.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        heroImage: true,
        published: true,
        showInMenu: true,
        menuOrder: true,
        parentSlug: true,
        pageType: true,
        createdAt: true,
        updatedAt: true,
        // Only include full content for admin users
        ...(isAdmin && { content: true, metaTitle: true, metaDescription: true, customFields: true })
      },
      orderBy: [
        { menuOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      pages,
      total: pages.length,
      isAdmin
    })

  } catch (error: any) {
    console.error('Get pages error:', error)
    return NextResponse.json({ error: 'Sayfalar yüklenirken hata oluştu' }, { status: 500 })
  }
}

// POST - Create new page (Admin only)
export const POST = requireAdmin(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = sanitizeInputData(body)
    
    // Validate input
    const validation = validateInput(sanitizedData, pageSchema)
    if (!validation.valid) {
      logSecurityEvent({
        type: 'INVALID_PAGE_DATA',
        userId: user.userId,
        details: { errors: validation.errors }
      })
      return NextResponse.json({ 
        error: 'Geçersiz sayfa verisi', 
        details: validation.errors 
      }, { status: 400 })
    }

    const pageData = validation.data!

    // Generate slug if not provided or sanitize existing
    let slug = pageData.slug || generateSlug(pageData.title)
    slug = sanitizeSlug(slug)

    // Validate slug uniqueness
    const prisma = (await import('@/lib/prisma')).default
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    })

    if (existingPage) {
      return NextResponse.json({ 
        error: 'Bu slug zaten kullanılıyor. Farklı bir slug seçin.' 
      }, { status: 409 })
    }

    // Sanitize content and other fields
    const sanitizedPageData = {
      title: sanitizeInput(pageData.title),
      slug,
      content: sanitizePageContent(pageData.content),
      excerpt: pageData.excerpt ? sanitizeInput(pageData.excerpt) : null,
      metaTitle: pageData.metaTitle ? sanitizeInput(pageData.metaTitle) : null,
      metaDescription: pageData.metaDescription ? sanitizeInput(pageData.metaDescription) : null,
      heroImage: pageData.heroImage || null,
      published: pageData.published !== undefined ? pageData.published : false,
      showInMenu: pageData.showInMenu !== undefined ? pageData.showInMenu : false,
      menuOrder: pageData.menuOrder || 0,
      parentSlug: pageData.parentSlug || null,
      pageType: pageData.pageType || 'page',
      customFields: pageData.customFields || {}
    }

    // Create page
    const newPage = await prisma.page.create({
      data: sanitizedPageData
    })

    // Log successful creation
    logSecurityEvent({
      type: 'PAGE_CREATED',
      userId: user.userId,
      details: { pageId: newPage.id, slug: newPage.slug, title: newPage.title }
    })

    return NextResponse.json(newPage, { status: 201 })

  } catch (error: any) {
    console.error('Create page error:', error)
    
    logSecurityEvent({
      type: 'API_ERROR',
      userId: user.userId,
      details: { error: error.message, endpoint: 'POST /api/pages' }
    })
    
    return NextResponse.json({ error: 'Sayfa oluşturulurken hata oluştu' }, { status: 500 })
  }
})

// Helper functions
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 100) // Limit length
}

function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '') // Only allow letters, numbers, and hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100) // Limit length
}

function sanitizePageContent(content: string): string {
  // Allow basic HTML tags but sanitize dangerous ones
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'div', 'span', 'table', 'tr', 'td', 'th',
    'thead', 'tbody', 'pre', 'code'
  ]
  
  // Remove script tags and dangerous attributes
  let sanitized = content
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:/gi, '') // Remove data: protocol (except for images)
  
  // Allow data: protocol only for images
  sanitized = sanitized.replace(/(<img[^>]+src=["'])data:image\//gi, '$1data:image/')
  
  return sanitized
}