import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { uploadToS3, deleteFromS3, isS3Configured, getS3KeyFromUrl } from '@/lib/s3'
import { requireAuth, logSecurityEvent } from '@/lib/auth-middleware'
import { sanitizeInput } from '@/lib/security'

// Allowed file types with strict validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB (reduced from 200MB)
const MAX_FILES_PER_USER_PER_HOUR = 50 // Rate limiting per user

// File upload tracking for rate limiting
const uploadTracker = new Map<string, { count: number; resetTime: number }>()

// Validate file type by checking both MIME type and file signature
function validateFileType(buffer: Buffer, mimeType: string, fileName: string): { valid: boolean; error?: string } {
  // Check file extension
  const ext = path.extname(fileName).toLowerCase()
  const validImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  const validVideoExts = ['.mp4', '.webm', '.mov']
  
  const isImageExt = validImageExts.includes(ext)
  const isVideoExt = validVideoExts.includes(ext)
  
  if (!isImageExt && !isVideoExt) {
    return { valid: false, error: 'Desteklenmeyen dosya uzantısı' }
  }
  
  // Check MIME type
  const isImageMime = ALLOWED_IMAGE_TYPES.includes(mimeType)
  const isVideoMime = ALLOWED_VIDEO_TYPES.includes(mimeType)
  
  if (!isImageMime && !isVideoMime) {
    return { valid: false, error: 'Desteklenmeyen MIME tipi' }
  }
  
  // Cross-validate extension and MIME type
  if (isImageExt && !isImageMime) {
    return { valid: false, error: 'Dosya uzantısı ve içerik tipi uyuşmuyor' }
  }
  
  if (isVideoExt && !isVideoMime) {
    return { valid: false, error: 'Dosya uzantısı ve içerik tipi uyuşmuyor' }
  }
  
  // Check file signature (magic bytes)
  const signature = buffer.slice(0, 12).toString('hex').toUpperCase()
  
  // Image signatures
  const imageSignatures = [
    'FFD8FF', // JPEG
    '89504E47', // PNG
    '52494646', // WebP (RIFF)
    '47494638' // GIF
  ]
  
  // Video signatures
  const videoSignatures = [
    '000000', // MP4 (starts with ftyp)
    '1A45DFA3', // WebM
    '6674797071742020' // MOV
  ]
  
  const hasValidImageSignature = imageSignatures.some(sig => signature.startsWith(sig))
  const hasValidVideoSignature = videoSignatures.some(sig => signature.startsWith(sig))
  
  if (isImageMime && !hasValidImageSignature) {
    return { valid: false, error: 'Dosya içeriği geçersiz (resim değil)' }
  }
  
  if (isVideoMime && !hasValidVideoSignature) {
    return { valid: false, error: 'Dosya içeriği geçersiz (video değil)' }
  }
  
  return { valid: true }
}

// Check upload rate limit per user
function checkUploadRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const hourMs = 60 * 60 * 1000
  
  const userTracker = uploadTracker.get(userId)
  
  if (!userTracker || now > userTracker.resetTime) {
    uploadTracker.set(userId, {
      count: 1,
      resetTime: now + hourMs
    })
    return { allowed: true, remaining: MAX_FILES_PER_USER_PER_HOUR - 1 }
  }
  
  if (userTracker.count >= MAX_FILES_PER_USER_PER_HOUR) {
    return { allowed: false, remaining: 0 }
  }
  
  userTracker.count++
  return { allowed: true, remaining: MAX_FILES_PER_USER_PER_HOUR - userTracker.count }
}

// Scan file for potential threats (basic implementation)
async function scanFileForThreats(buffer: Buffer, fileName: string): Promise<{ safe: boolean; threat?: string }> {
  // Check for suspicious patterns in filename
  const suspiciousPatterns = [
    /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i, /\.pif$/i,
    /\.com$/i, /\.jar$/i, /\.js$/i, /\.vbs$/i, /\.php$/i,
    /<script/i, /javascript:/i, /vbscript:/i, /onload=/i, /onerror=/i
  ]
  
  if (suspiciousPatterns.some(pattern => pattern.test(fileName))) {
    return { safe: false, threat: 'Şüpheli dosya adı' }
  }
  
  // Check for suspicious content in file
  const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024))
  const suspiciousContent = [
    /<script/i, /javascript:/i, /vbscript:/i, /<?php/i,
    /eval\(/i, /exec\(/i, /system\(/i, /shell_exec/i
  ]
  
  if (suspiciousContent.some(pattern => pattern.test(content))) {
    return { safe: false, threat: 'Şüpheli dosya içeriği' }
  }
  
  return { safe: true }
}

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    // Check upload rate limit
    const rateLimit = checkUploadRateLimit(user.userId)
    if (!rateLimit.allowed) {
      logSecurityEvent({
        type: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        userId: user.userId,
        details: { limit: MAX_FILES_PER_USER_PER_HOUR }
      })
      return NextResponse.json({ 
        error: 'Çok fazla dosya yükleme denemesi. Lütfen bir saat sonra tekrar deneyin.' 
      }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null // 'image' or 'video'

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    // Validate file size first (before reading buffer)
    const isImage = type === 'image'
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      logSecurityEvent({
        type: 'UPLOAD_SIZE_EXCEEDED',
        userId: user.userId,
        details: { fileSize: file.size, maxSize, fileName: file.name }
      })
      return NextResponse.json({ 
        error: `Dosya boyutu çok büyük. Maksimum: ${maxSizeMB}MB` 
      }, { status: 400 })
    }

    // Sanitize filename
    const originalName = sanitizeInput(file.name)
    if (originalName.length < 1) {
      return NextResponse.json({ error: 'Geçersiz dosya adı' }, { status: 400 })
    }

    console.log(`📁 File upload request: ${originalName} (${file.type}, ${file.size} bytes) by user ${user.userId}`)

    // Get file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate file type and content
    const typeValidation = validateFileType(buffer, file.type, originalName)
    if (!typeValidation.valid) {
      logSecurityEvent({
        type: 'INVALID_FILE_TYPE',
        userId: user.userId,
        details: { fileName: originalName, mimeType: file.type, error: typeValidation.error }
      })
      return NextResponse.json({ error: typeValidation.error }, { status: 400 })
    }

    // Scan for threats
    const threatScan = await scanFileForThreats(buffer, originalName)
    if (!threatScan.safe) {
      logSecurityEvent({
        type: 'MALICIOUS_FILE_DETECTED',
        userId: user.userId,
        details: { fileName: originalName, threat: threatScan.threat }
      })
      return NextResponse.json({ 
        error: 'Güvenlik nedeniyle dosya yüklenemedi: ' + threatScan.threat 
      }, { status: 400 })
    }

    // Generate secure filename
    const timestamp = Date.now()
    const randomId = uuidv4()
    const ext = path.extname(originalName).toLowerCase()
    const filename = `${timestamp}-${randomId}${ext}`
    
    let url: string
    let storageType: 's3' | 'local' = 'local'
    let uploadId = `upload-${timestamp}-${randomId}`

    try {
      // Check S3/MinIO configuration
      const s3Configured = isS3Configured()
      console.log(`🔧 S3/MinIO configured: ${s3Configured}`)

      if (s3Configured) {
        try {
          const folder = isImage ? 'images' : 'videos'
          const s3Key = `uploads/${folder}/${filename}`
          
          console.log(`☁️  Uploading to MinIO: ${s3Key}`)
          url = await uploadToS3(buffer, s3Key, file.type)
          storageType = 's3'
          
          console.log(`✅ File uploaded to MinIO: ${url}`)
        } catch (s3Error: any) {
          console.error('❌ MinIO upload failed, falling back to local:', s3Error)
          
          logSecurityEvent({
            type: 'S3_UPLOAD_FAILED',
            userId: user.userId,
            details: { error: s3Error.message, fileName: originalName }
          })
          
          // Üretimde yerel diske yedekleme YAPILMAZ: konteyner diski her deploy'da silinir, resim kaybolur.
          if (process.env.NODE_ENV === 'production') {
            throw new Error('Dosya depolama (MinIO) şu anda kullanılamıyor. Lütfen biraz sonra tekrar deneyin.')
          }
          url = await saveToLocal(buffer, filename, isImage)
          console.log(`💾 File saved locally (development): ${url}`)
        }
      } else {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Dosya depolama (MinIO) yapılandırılmamış. Yönetici ile iletişime geçin.')
        }
        console.log('⚠️  MinIO not configured, using local storage (development)')
        url = await saveToLocal(buffer, filename, isImage)
        console.log(`💾 File saved locally: ${url}`)
      }

      // Try to save to database
      let fileId = `file-${timestamp}`
      try {
        const prisma = (await import('@/lib/prisma')).default
        const uploadedFile = await prisma.uploadedFile.create({
          data: {
            filename,
            originalName,
            mimeType: file.type,
            size: file.size,
            path: storageType === 's3' ? `s3:${url}` : path.join(process.cwd(), 'public', url),
            url,
            uploadedBy: user.userId,
          }
        })
        fileId = uploadedFile.id
        console.log(`💾 File record saved to database: ${fileId}`)
      } catch (dbError) {
        console.warn('⚠️  Database save skipped:', dbError)
      }

      // Log successful upload
      logSecurityEvent({
        type: 'FILE_UPLOADED',
        userId: user.userId,
        details: { 
          fileId, 
          fileName: originalName, 
          size: file.size, 
          storageType,
          url: url.substring(0, 50) + '...' // Truncate URL for logging
        }
      })

      return NextResponse.json({
        success: true,
        file: {
          id: fileId,
          url,
          filename,
          originalName,
          mimeType: file.type,
          size: file.size,
          storageType,
        }
      })

    } catch (uploadError: any) {
      // Cleanup failed upload
      try {
        if (storageType === 'local' && url) {
          const filePath = path.join(process.cwd(), 'public', url)
          await unlink(filePath).catch(() => {}) // Ignore cleanup errors
        }
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError)
      }

      logSecurityEvent({
        type: 'UPLOAD_FAILED',
        userId: user.userId,
        details: { error: uploadError.message, fileName: originalName }
      })

      throw uploadError
    }

  } catch (error: any) {
    console.error('❌ Upload error:', error)
    
    logSecurityEvent({
      type: 'UPLOAD_ERROR',
      userId: user.userId,
      details: { error: error.message }
    })
    
    return NextResponse.json({ 
      error: 'Dosya yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata')
    }, { status: 500 })
  }
})

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

// Delete uploaded file (Authenticated users only)
export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')
    const fileUrl = searchParams.get('url')

    console.log(`🗑️  Delete request by user ${user.userId}: ID=${fileId}, URL=${fileUrl}`)

    if (!fileId && !fileUrl) {
      return NextResponse.json({ error: 'Dosya ID veya URL gerekli' }, { status: 400 })
    }

    let fileRecord: any = null

    // Try to find file in database first
    try {
      const prisma = (await import('@/lib/prisma')).default
      
      if (fileId) {
        fileRecord = await prisma.uploadedFile.findUnique({ 
          where: { id: fileId } 
        })
      } else if (fileUrl) {
        fileRecord = await prisma.uploadedFile.findFirst({ 
          where: { url: fileUrl } 
        })
      }

      // Check if user has permission to delete this file
      if (fileRecord) {
        // Only allow deletion if user uploaded the file or is admin
        if (fileRecord.uploadedBy !== user.userId && user.role !== 'admin') {
          logSecurityEvent({
            type: 'UNAUTHORIZED_FILE_DELETE_ATTEMPT',
            userId: user.userId,
            details: { fileId: fileRecord.id, fileOwner: fileRecord.uploadedBy }
          })
          return NextResponse.json({ 
            error: 'Bu dosyayı silme yetkiniz yok' 
          }, { status: 403 })
        }
      }
    } catch (dbError) {
      console.warn('⚠️  Database query failed:', dbError)
    }

    // Determine if it's an S3 URL
    const isS3Url = fileUrl?.includes('.s3.') || 
                   fileUrl?.includes('s3.amazonaws.com') || 
                   (process.env.S3_PUBLIC_URL && fileUrl?.startsWith(process.env.S3_PUBLIC_URL)) ||
                   fileUrl?.includes('46.224.248.228:9000') // MinIO specific

    // Delete from S3/MinIO if applicable
    if (isS3Url && fileUrl) {
      const s3Key = getS3KeyFromUrl(fileUrl)
      if (s3Key) {
        try {
          await deleteFromS3(s3Key)
          console.log(`✅ File deleted from MinIO: ${s3Key}`)
        } catch (s3Error: any) {
          console.error('❌ MinIO delete error:', s3Error)
          logSecurityEvent({
            type: 'S3_DELETE_FAILED',
            userId: user.userId,
            details: { error: s3Error.message, s3Key }
          })
        }
      }
    }

    // Delete from database
    if (fileRecord) {
      try {
        const prisma = (await import('@/lib/prisma')).default
        
        // Delete from filesystem if local
        if (!fileRecord.path.startsWith('s3:')) {
          try {
            await unlink(fileRecord.path)
            console.log(`✅ Local file deleted: ${fileRecord.path}`)
          } catch (e) {
            console.warn('⚠️  File not found on disk:', fileRecord.path)
          }
        }

        // Delete from database
        await prisma.uploadedFile.delete({ where: { id: fileRecord.id } })
        console.log(`✅ Database record deleted: ${fileRecord.id}`)
        
        // Log successful deletion
        logSecurityEvent({
          type: 'FILE_DELETED',
          userId: user.userId,
          details: { 
            fileId: fileRecord.id, 
            fileName: fileRecord.originalName,
            wasOwner: fileRecord.uploadedBy === user.userId
          }
        })
        
        return NextResponse.json({ success: true, message: 'Dosya başarıyla silindi' })
      } catch (dbError: any) {
        console.error('Database delete error:', dbError)
        logSecurityEvent({
          type: 'DATABASE_ERROR',
          userId: user.userId,
          details: { error: dbError.message, operation: 'DELETE_FILE' }
        })
      }
    }

    // If no database record, try to delete file directly from URL (local only)
    if (fileUrl && !isS3Url) {
      const filePath = path.join(process.cwd(), 'public', fileUrl)
      try {
        await unlink(filePath)
        console.log(`✅ Local file deleted directly: ${filePath}`)
        
        logSecurityEvent({
          type: 'FILE_DELETED_DIRECT',
          userId: user.userId,
          details: { filePath: fileUrl }
        })
        
        return NextResponse.json({ success: true, message: 'Dosya silindi' })
      } catch (e) {
        console.warn('⚠️  File not found:', filePath)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Dosya zaten silinmiş olabilir' 
    })

  } catch (error: any) {
    console.error('❌ Delete error:', error)
    
    logSecurityEvent({
      type: 'DELETE_ERROR',
      userId: user.userId,
      details: { error: error.message }
    })
    
    return NextResponse.json({ 
      error: 'Dosya silinirken bir hata oluştu' 
    }, { status: 500 })
  }
})
