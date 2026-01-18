import { NextRequest, NextResponse } from 'next/server'
import { isS3Configured } from '@/lib/s3'

export async function GET() {
  try {
    const s3Status = isS3Configured()
    
    return NextResponse.json({
      success: true,
      message: 'Video upload test endpoint',
      s3Configured: s3Status,
      environment: {
        S3_ENDPOINT: process.env.S3_ENDPOINT || 'Not set',
        S3_BUCKET: process.env.S3_BUCKET || 'Not set',
        S3_PUBLIC_URL: process.env.S3_PUBLIC_URL || 'Not set',
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set',
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set',
      },
      supportedVideoFormats: ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi', 'video/ogg'],
      maxVideoSize: '200MB',
      uploadPath: '/api/upload',
    })
  } catch (error) {
    console.error('Test video upload error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Test file validation
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi', 'video/ogg']
    const maxSize = 200 * 1024 * 1024 // 200MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid video format',
        received: file.type,
        allowed: allowedTypes
      }, { status: 400 })
    }

    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large',
        size: file.size,
        maxSize: maxSize,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
        maxSizeMB: (maxSize / (1024 * 1024)).toFixed(2)
      }, { status: 400 })
    }

    // Forward to actual upload endpoint
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('type', 'video')

    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload`, {
      method: 'POST',
      body: uploadFormData
    })

    const uploadResult = await uploadResponse.json()

    return NextResponse.json({
      success: uploadResponse.ok,
      testResult: 'Video upload test completed',
      uploadResponse: uploadResult,
      fileInfo: {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2)
      }
    })

  } catch (error) {
    console.error('Test video upload error:', error)
    return NextResponse.json({ 
      error: 'Test upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}