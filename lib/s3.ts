import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// S3 Configuration
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  // For S3-compatible services (MinIO, DigitalOcean Spaces, etc.)
  ...(process.env.S3_ENDPOINT && {
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true, // Required for MinIO
  }),
}

export const s3Client = new S3Client(s3Config)

export const S3_BUCKET = process.env.S3_BUCKET || 'petfendy'
export const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || `https://${S3_BUCKET}.s3.${s3Config.region}.amazonaws.com`

// Check if S3 is configured
export function isS3Configured(): boolean {
  const configured = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET
  )
  
  console.log('🔧 S3/MinIO Configuration Check:')
  console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`)
  console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   S3_BUCKET: ${process.env.S3_BUCKET || '❌ Missing'}`)
  console.log(`   S3_ENDPOINT: ${process.env.S3_ENDPOINT || '❌ Missing (using AWS S3)'}`)
  console.log(`   S3_PUBLIC_URL: ${S3_PUBLIC_URL}`)
  console.log(`   Configured: ${configured ? '✅ Yes' : '❌ No'}`)
  
  return configured
}

// Upload file to S3/MinIO
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  console.log(`☁️  Uploading to S3/MinIO: ${key} (${contentType})`)
  
  // Set appropriate cache control based on file type
  const isVideo = contentType.startsWith('video/')
  const cacheControl = isVideo ? 'max-age=86400' : 'max-age=31536000' // 1 day for videos, 1 year for images
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read', // Make file publicly accessible
    CacheControl: cacheControl,
    // Add metadata for videos
    ...(isVideo && {
      Metadata: {
        'uploaded-by': 'petfendy-app',
        'file-type': 'video',
        'upload-timestamp': Date.now().toString()
      }
    })
  })

  try {
    await s3Client.send(command)
    
    // Return public URL
    const publicUrl = `${S3_PUBLIC_URL}/${key}`
    console.log(`✅ Upload successful: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error('❌ S3/MinIO upload error:', error)
    throw error
  }
}

// Delete file from S3/MinIO
export async function deleteFromS3(key: string): Promise<void> {
  console.log(`🗑️  Deleting from S3/MinIO: ${key}`)
  
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  })

  try {
    await s3Client.send(command)
    console.log(`✅ Delete successful: ${key}`)
  } catch (error) {
    console.error('❌ S3/MinIO delete error:', error)
    throw error
  }
}

// Get signed URL for private files (optional)
export async function getSignedS3Url(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

// Extract S3 key from URL
export function getS3KeyFromUrl(url: string): string | null {
  try {
    console.log(`🔍 Extracting S3 key from URL: ${url}`)
    
    // Handle MinIO URL format: http://46.224.248.228:9000/petfendy/uploads/images/file.jpg
    if (url.includes('46.224.248.228:9000') || url.includes(S3_BUCKET)) {
      const urlObj = new URL(url)
      let pathname = urlObj.pathname
      
      // Remove bucket name from path if present
      if (pathname.startsWith(`/${S3_BUCKET}/`)) {
        pathname = pathname.substring(`/${S3_BUCKET}/`.length)
      } else if (pathname.startsWith('/')) {
        pathname = pathname.substring(1)
      }
      
      console.log(`✅ Extracted key: ${pathname}`)
      return pathname
    }
    
    // Handle standard S3 URL formats
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    // Remove leading slash
    const key = pathname.startsWith('/') ? pathname.slice(1) : pathname
    console.log(`✅ Extracted key: ${key}`)
    return key
  } catch (error) {
    console.error('❌ Failed to extract S3 key from URL:', error)
    return null
  }
}
