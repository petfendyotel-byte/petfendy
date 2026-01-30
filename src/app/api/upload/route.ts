import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync, statSync } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { RateLimiter } from '@/lib/security'

// Rate limiter: 20 uploads per 15 minutes per IP
const uploadRateLimiter = new RateLimiter(20, 15 * 60 * 1000)

// Allowed file types with their magic numbers (file signatures)
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': { ext: ['.jpg', '.jpeg'], magic: ['FFD8FF'] },
  'image/png': { ext: ['.png'], magic: ['89504E47'] },
  'image/webp': { ext: ['.webp'], magic: ['52494646'] },
  'image/gif': { ext: ['.gif'], magic: ['474946'] },
}

const ALLOWED_VIDEO_TYPES = {
  'video/mp4': { ext: ['.mp4'], magic: ['00000'] },
  'video/webm': { ext: ['.webm'], magic: ['1A45DFA3'] },
  'video/ogg': { ext: ['.ogg', '.ogv'], magic: ['4F676753'] },
}

// File size limits (in bytes)
const MAX_IMAGE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE || '104857600') // 100MB

/**
 * Check file signature (magic numbers) to prevent file type spoofing
 */
function checkFileSignature(buffer: Buffer, allowedSignatures: string[]): boolean {
  const fileSignature = buffer.toString('hex', 0, 4).toUpperCase()
  return allowedSignatures.some(sig => fileSignature.startsWith(sig))
}

/**
 * Generate secure random filename
 */
function generateSecureFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const randomBytes = crypto.randomBytes(16).toString('hex')
  const timestamp = Date.now()
  return `room_${timestamp}_${randomBytes}${ext}`
}

/**
 * Validate file type and size
 */
function validateFile(
  file: File,
  buffer: Buffer,
  allowedTypes: Record<string, any>,
  maxSize: number
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${maxSize / 1024 / 1024}MB)`
    }
  }

  // Check MIME type
  const fileType = allowedTypes[file.type]
  if (!fileType) {
    return { valid: false, error: 'File type not allowed' }
  }

  // Check file extension
  const ext = path.extname(file.name).toLowerCase()
  if (!fileType.ext.includes(ext)) {
    return { valid: false, error: 'File extension does not match MIME type' }
  }

  // Check magic numbers (file signature)
  if (!checkFileSignature(buffer, fileType.magic)) {
    return { valid: false, error: 'File signature validation failed' }
  }

  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Check rate limit
    if (uploadRateLimiter.isLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Too many upload requests. Please try again later.' },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Limit number of files per request
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files per upload' },
        { status: 400 }
      )
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'rooms')

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uploadedUrls: string[] = []
    const errors: string[] = []

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Determine if it's an image or video based on MIME type
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')

        if (!isImage && !isVideo) {
          errors.push(`${file.name}: Invalid file type`)
          continue
        }

        // Validate file
        const validation = validateFile(
          file,
          buffer,
          isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES,
          isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
        )

        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.error}`)
          continue
        }

        // Generate secure filename (prevents path traversal)
        const filename = generateSecureFilename(file.name)
        const filepath = path.join(uploadDir, filename)

        // Write file
        await writeFile(filepath, buffer)

        // Verify file was written correctly
        const stats = statSync(filepath)
        if (stats.size !== buffer.length) {
          errors.push(`${file.name}: File write verification failed`)
          continue
        }

        // Return URL path
        uploadedUrls.push(`/uploads/rooms/${filename}`)
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        errors.push(`${file.name}: Processing failed`)
      }
    }

    // Return response
    if (uploadedUrls.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { error: 'All uploads failed', details: errors },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
