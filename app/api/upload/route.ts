import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null // 'image' or 'video'

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    const mimeType = file.type
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType)

    // Validate file type
    if (type === 'image' && !isImage) {
      return NextResponse.json({ 
        error: 'Geçersiz resim formatı. Desteklenen formatlar: JPEG, PNG, WebP, GIF' 
      }, { status: 400 })
    }

    if (type === 'video' && !isVideo) {
      return NextResponse.json({ 
        error: 'Geçersiz video formatı. Desteklenen formatlar: MP4, WebM, MOV' 
      }, { status: 400 })
    }

    if (!isImage && !isVideo) {
      return NextResponse.json({ 
        error: 'Desteklenmeyen dosya formatı' 
      }, { status: 400 })
    }

    // Validate file size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return NextResponse.json({ 
        error: `Dosya boyutu çok büyük. Maksimum: ${maxSizeMB}MB` 
      }, { status: 400 })
    }

    // Generate unique filename
    const ext = path.extname(file.name) || (isImage ? '.jpg' : '.mp4')
    const filename = `${uuidv4()}${ext}`
    
    // Determine upload directory
    const uploadDir = isImage ? 'uploads/images' : 'uploads/videos'
    const fullUploadDir = path.join(process.cwd(), 'public', uploadDir)

    // Create directory if it doesn't exist
    if (!existsSync(fullUploadDir)) {
      await mkdir(fullUploadDir, { recursive: true })
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(fullUploadDir, filename)
    await writeFile(filePath, buffer)

    // Generate URL
    const url = `/${uploadDir}/${filename}`

    // Try to save to database (optional - don't fail if DB is unavailable)
    let fileId = `file-${Date.now()}`
    try {
      const prisma = (await import('@/lib/prisma')).default
      const uploadedFile = await prisma.uploadedFile.create({
        data: {
          filename,
          originalName: file.name,
          mimeType,
          size: file.size,
          path: filePath,
          url,
        }
      })
      fileId = uploadedFile.id
    } catch (dbError) {
      console.warn('Database save skipped:', dbError)
      // Continue without database - file is already saved to disk
    }

    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        url,
        filename,
        originalName: file.name,
        mimeType,
        size: file.size,
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Dosya yüklenirken bir hata oluştu' 
    }, { status: 500 })
  }
}

// Delete uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')
    const fileUrl = searchParams.get('url')

    if (!fileId && !fileUrl) {
      return NextResponse.json({ error: 'Dosya ID veya URL gerekli' }, { status: 400 })
    }

    // Try to find and delete from database
    try {
      const prisma = (await import('@/lib/prisma')).default
      const file = fileId 
        ? await prisma.uploadedFile.findUnique({ where: { id: fileId } })
        : await prisma.uploadedFile.findFirst({ where: { url: fileUrl! } })

      if (file) {
        // Delete from filesystem
        const fs = await import('fs/promises')
        try {
          await fs.unlink(file.path)
        } catch (e) {
          console.warn('File not found on disk:', file.path)
        }

        // Delete from database
        await prisma.uploadedFile.delete({ where: { id: file.id } })
        return NextResponse.json({ success: true })
      }
    } catch (dbError) {
      console.warn('Database delete skipped:', dbError)
    }

    // If no database record, try to delete file directly from URL
    if (fileUrl) {
      const fs = await import('fs/promises')
      const filePath = path.join(process.cwd(), 'public', fileUrl)
      try {
        await fs.unlink(filePath)
        return NextResponse.json({ success: true })
      } catch (e) {
        console.warn('File not found:', filePath)
      }
    }

    return NextResponse.json({ success: true, message: 'File may have been already deleted' })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ 
      error: 'Dosya silinirken bir hata oluştu' 
    }, { status: 500 })
  }
}
