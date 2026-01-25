import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, validateInput, sanitizeInputData, logSecurityEvent, optionalAuth } from '@/lib/auth-middleware'
import { sanitizeInput } from '@/lib/security'

// Page update validation schema
const pageUpdateSchema = {
  title: { type: 'string', minLength: 2, maxLength: 200 },
  slug: { type: 'string', minLength: 2, maxLength: 100 },
  content: { type: 'string', minLength: 10 },
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

// GET - Get single page by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Validate slug format
    if (!slug || typeof slug !== 'string' || slug.length < 2) {
      return NextResponse.json({ error: 'Geçersiz sayfa slug' }, { status: 400 })
    }

    // Check if user is admin
    const user = await optionalAuth(request)
    const isAdmin = user?.role === 'admin'

    const prisma = (await import('@/lib/prisma')).default
    
    const page = await prisma.page.findUnique({
      where: { slug }
    })

    if (!page) {
      return NextResponse.json({ error: 'Sayfa bulunamadı' }, { status: 404 })
    }

    // Only show unpublished pages to admin users
    if (!page.published && !isAdmin) {
      return NextResponse.json({ error: 'Sayfa bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(page)

  } catch (error: any) {
    console.error('Get page error:', error)
    return NextResponse.json({ error: 'Sayfa yüklenirken hata oluştu' }, { status: 500 })
  }
}

// PUT - Update page (Admin only)
export const PUT = requireAdmin(async (
  request: NextRequest,
  user,
  { params }: { params: { slug: string } }
) => {
  try {
    const { slug } = params

    // Validate slug format
    if (!slug || typeof slug !== 'string' || slug.length < 2) {
      return NextResponse.json({ error: 'Geçersiz sayfa slug' }, { status: 400 })
    }

    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = sanitizeInputData(body)
    
    // Validate input
    const validation = validateInput(sanitizedData, pageUpdateSchema)
    if (!validation.valid) {
      logSecurityEvent({
        type: 'INVALID_PAGE_UPDATE_DATA',
        userId: user.userId,
        details: { slug, errors: validation.errors }
      })
      return NextResponse.json({ 
        error: 'Geçersiz güncelleme verisi', 
        details: validation.errors 
      }, { status: 400 })
    }

    const updateData = validation.data!

    const prisma = (await import('@/lib/prisma')).default
    
    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    })

    if (!existingPage) {
      return NextResponse.json({ error: 'Sayfa bulunamadı' }, { status: 404 })
    }

    // If slug is being updated, check for conflicts
    if (updateData.slug && updateData.slug !== slug) {
      const newSlug = sanitizeSlug(updateData.slug)
      const conflictingPage = await prisma.page.findUnique({
        where: { slug: newSlug }
      })
      
      if (conflictingPage) {
        return NextResponse.json({ 
          error: 'Bu slug zaten kullanılıyor' 
        }, { status: 409 })
      }
      updateData.slug = newSlug
    }

    // Prepare update data
    const dbUpdateData: any = {}
    
    if (updateData.title !== undefined) {
      dbUpdateData.title = sanitizeInput(updateData.title)
    }
    if (updateData.slug !== undefined) {
      dbUpdateData.slug = updateData.slug
    }
    if (updateData.content !== undefined) {
      dbUpdateData.content = sanitizePageContent(updateData.content)
    }
    if (updateData.excerpt !== undefined) {
      dbUpdateData.excerpt = updateData.excerpt ? sanitizeInput(updateData.excerpt) : null
    }
    if (updateData.metaTitle !== undefined) {
      dbUpdateData.metaTitle = updateData.metaTitle ? sanitizeInput(updateData.metaTitle) : null
    }
    if (updateData.metaDescription !== undefined) {
      dbUpdateData.metaDescription = updateData.metaDescription ? sanitizeInput(updateData.metaDescription) : null
    }
    if (updateData.heroImage !== undefined) {
      dbUpdateData.heroImage = updateData.heroImage || null
    }
    if (updateData.published !== undefined) {
      dbUpdateData.published = updateData.published
    }
    if (updateData.showInMenu !== undefined) {
      dbUpdateData.showInMenu = updateData.showInMenu
    }
    if (updateData.menuOrder !== undefined) {
      dbUpdateData.menuOrder = Math.max(0, Math.min(100, updateData.menuOrder))
    }
    if (updateData.parentSlug !== undefined) {
      dbUpdateData.parentSlug = updateData.parentSlug || null
    }
    if (updateData.pageType !== undefined) {
      dbUpdateData.pageType = updateData.pageType || 'page'
    }
    if (updateData.customFields !== undefined) {
      dbUpdateData.customFields = updateData.customFields || {}
    }

    // Update page
    const updatedPage = await prisma.page.update({
      where: { slug },
      data: dbUpdateData
    })

    // Log successful update
    logSecurityEvent({
      type: 'PAGE_UPDATED',
      userId: user.userId,
      details: { 
        pageId: updatedPage.id,
        slug: updatedPage.slug,
        title: updatedPage.title,
        updatedFields: Object.keys(updateData)
      }
    })

    return NextResponse.json(updatedPage)

  } catch (error: any) {
    console.error('Update page error:', error)
    
    logSecurityEvent({
      type: 'API_ERROR',
      userId: user.userId,
      details: { error: error.message, endpoint: `PUT /api/pages/${params.slug}` }
    })
    
    return NextResponse.json({ error: 'Sayfa güncellenirken hata oluştu' }, { status: 500 })
  }
})

// DELETE - Delete page (Admin only)
export const DELETE = requireAdmin(async (
  request: NextRequest,
  user,
  { params }: { params: { slug: string } }
) => {
  try {
    const { slug } = params

    // Validate slug format
    if (!slug || typeof slug !== 'string' || slug.length < 2) {
      return NextResponse.json({ error: 'Geçersiz sayfa slug' }, { status: 400 })
    }

    // Prevent deletion of critical pages
    const protectedSlugs = ['home', 'hakkimda', 'iletisim', 'hizmetler']
    if (protectedSlugs.includes(slug)) {
      return NextResponse.json({ 
        error: 'Bu sayfa sistem sayfası olduğu için silinemez' 
      }, { status: 403 })
    }

    const prisma = (await import('@/lib/prisma')).default
    
    // Check if page exists
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    })

    if (!existingPage) {
      return NextResponse.json({ error: 'Sayfa bulunamadı' }, { status: 404 })
    }

    // Check if page has child pages
    const childPages = await prisma.page.findMany({
      where: { parentSlug: slug }
    })

    if (childPages.length > 0) {
      return NextResponse.json({ 
        error: `Bu sayfanın ${childPages.length} alt sayfası var. Önce alt sayfaları silin.` 
      }, { status: 409 })
    }

    // Delete page
    await prisma.page.delete({
      where: { slug }
    })

    // Log successful deletion
    logSecurityEvent({
      type: 'PAGE_DELETED',
      userId: user.userId,
      details: { 
        pageId: existingPage.id,
        slug: existingPage.slug,
        title: existingPage.title
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Sayfa başarıyla silindi' 
    })

  } catch (error: any) {
    console.error('Delete page error:', error)
    
    logSecurityEvent({
      type: 'API_ERROR',
      userId: user.userId,
      details: { error: error.message, endpoint: `DELETE /api/pages/${params.slug}` }
    })
    
    return NextResponse.json({ error: 'Sayfa silinirken hata oluştu' }, { status: 500 })
  }
})

// Helper functions
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