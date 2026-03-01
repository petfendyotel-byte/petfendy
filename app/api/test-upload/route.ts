import { NextRequest, NextResponse } from 'next/server'
import { isS3Configured } from '@/lib/s3'

// Test endpoint for upload configuration
// Güvenlik: Production'da devre dışı
const isProduction = process.env.NODE_ENV === 'production'

export async function GET(request: NextRequest) {
  if (isProduction) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  try {
    // Check MinIO/S3 configuration
    const s3Configured = isS3Configured()
    
    // Test MinIO connection
    let connectionTest = {
      status: 'unknown',
      error: null,
      details: null
    }
    
    if (s3Configured) {
      try {
        const { S3Client, ListBucketsCommand } = await import('@aws-sdk/client-s3')
        const { s3Client } = await import('@/lib/s3')
        
        console.log('🔍 Testing MinIO connection...')
        const command = new ListBucketsCommand({})
        const result = await s3Client.send(command)
        
        connectionTest = {
          status: 'success',
          error: null,
          details: `Found ${result.Buckets?.length || 0} buckets`
        }
        console.log('✅ MinIO connection successful')
      } catch (error) {
        connectionTest = {
          status: 'failed',
          error: error.code || error.name,
          details: error.message
        }
        console.error('❌ MinIO connection failed:', error)
      }
    }
    
    const config = {
      s3Configured,
      connectionTest,
      environment: {
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing',
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing',
        S3_BUCKET: process.env.S3_BUCKET || '❌ Missing',
        S3_ENDPOINT: process.env.S3_ENDPOINT || '❌ Missing',
        S3_PUBLIC_URL: process.env.S3_PUBLIC_URL || '❌ Missing',
        AWS_REGION: process.env.AWS_REGION || 'us-east-1',
      },
      status: s3Configured ? 
        (connectionTest.status === 'success' ? 'MinIO CDN Ready' : 'MinIO Configured but Connection Failed') : 
        'Using Local Storage',
      uploadEndpoint: '/api/upload',
      troubleshooting: {
        commonIssues: [
          {
            issue: 'ECONNREFUSED',
            solution: 'MinIO server is not accessible. Check if MinIO service is running on Coolify.',
            checkUrl: 'http://46.224.248.228:8000 (Coolify Dashboard)'
          },
          {
            issue: 'InvalidAccessKeyId',
            solution: 'Invalid MinIO credentials. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.',
            action: 'Verify credentials in MinIO Console'
          },
          {
            issue: 'NoSuchBucket',
            solution: 'Bucket "petfendy" does not exist. Create it in MinIO Console.',
            action: 'Create bucket and set public read policy'
          }
        ]
      },
      testInstructions: [
        '1. Check MinIO service status in Coolify',
        '2. Verify MinIO Console is accessible',
        '3. Ensure "petfendy" bucket exists and is public',
        '4. Test upload from admin panel',
        '5. Check console logs for detailed errors'
      ]
    }

    return NextResponse.json({
      success: true,
      message: 'Upload configuration test',
      timestamp: new Date().toISOString(),
      config
    })

  } catch (error) {
    console.error('Upload test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}