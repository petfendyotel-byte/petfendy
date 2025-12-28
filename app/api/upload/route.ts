import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { uploadToS3, deleteFromS3, isS3Configured, getS3KeyFromUrl } from '@/lib/s3'

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
    
    // Get file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let url: string
    let storageType: 's3' | 'local' = 'local'

    // Try S3 first if configured
    if (isS3Configured()) {
      try {
        const folder = isImage ? 'images' : 'videos'
        const s3Key = `uploads/${folder}/${filename}`
        url = await uploadToS3(buffer, s3Key, mimeType)
        storageType = 's3'
        console.log('File uploaded to S3:', url)
      } catch (s3Error) {
        console.error('S3 upload failed, falling back to local:', s3Error)
        // Fall back to local storage
        url = await saveToLocal(buffer, filename, isImage)
      }
    } else {
      // Use local storage
      url = await saveToLocal(buffer, filename, isImage)
    }

    // Try to save to database (optional)
    let fileId = `file-${Date.now()}`
    try {
      const prisma = (await import('@/lib/prisma')).default
      const uploadedFile = await prisma.uploadedFile.create({
        data: {
          filename,
          originalName: file.name,
          mimeType,
          size: file.size,
          path: storageType === 's3' ? `s3:${url}` : path.join(process.cwd(), 'public', url),
          url,
        }
      })
      fileId = uploadedFile.id
    } catch (dbError) {
      console.warn('Database save skipped:', dbError)
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
        storageType,
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Dosya yüklenirken bir hata oluştu' 
    }, { status: 500 })
  }
}

// Helper function to save file locally
async function saveToLocal(buffer: Buffer, filename: string, isImage: boolean): Promise<string> {
  const uploadDir = isImage ? 'uploads/images' : 'uploads/videos'
  const fullUploadDir = path.join(process.cwd(), 'public', uploadDir)

  if (!existsSync(fullUploadDir)) {
    await mkdir(fullUploadDir, { recursive: true })
  }

  const filePath = path.join(fullUploadDir, filename)
  await writeFile(filePath, buffer)

  return `/${uploadDir}/${filename}`
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

    // Check if it's an S3 URL
    const isS3Url = fileUrl?.includes('.s3.') || fileUrl?.includes('s3.amazonaws.com') || 
                   (process.env.S3_PUBLIC_URL && fileUrl?.startsWith(process.env.S3_PUBLIC_URL))

    if (isS3Url && fileUrl) {
      // Delete from S3
      const s3Key = getS3KeyFromUrl(fileUrl)
      if (s3Key) {
        try {
          await deleteFromS3(s3Key)
          console.log('File deleted from S3:', s3Key)
        } catch (s3Error) {
          console.error('S3 delete error:', s3Error)
        }
      }
    }

    // Try to find and delete from database
    try {
      const prisma = (await import('@/lib/prisma')).default
      const file = fileId 
        ? await prisma.uploadedFile.findUnique({ where: { id: fileId } })
        : await prisma.uploadedFile.findFirst({ where: { url: fileUrl! } })

      if (file) {
        // Delete from filesystem if local
        if (!file.path.startsWith('s3:')) {
          try {
            await unlink(file.path)
          } catch (e) {
            console.warn('File not found on disk:', file.path)
          }
        }

        // Delete from database
        await prisma.uploadedFile.delete({ where: { id: file.id } })
        return NextResponse.json({ success: true })
      }
    } catch (dbError) {
      console.warn('Database delete skipped:', dbError)
    }

    // If no database record, try to delete file directly from URL (local only)
    if (fileUrl && !isS3Url) {
      const filePath = path.join(process.cwd(), 'public', fileUrl)
      try {
        await unlink(filePath)
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
