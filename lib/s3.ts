import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// S3 Configuration
const s3Config = {
  region: process.env.AWS_REGION || 'eu-central-1',
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
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET
  )
}

// Upload file to S3
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read', // Make file publicly accessible
  })

  await s3Client.send(command)
  
  // Return public URL
  return `${S3_PUBLIC_URL}/${key}`
}

// Delete file from S3
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  })

  await s3Client.send(command)
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
    // Handle both S3 URL formats
    // https://bucket.s3.region.amazonaws.com/key
    // https://s3.region.amazonaws.com/bucket/key
    // Custom endpoint: https://custom.endpoint/bucket/key
    
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    // Remove leading slash
    return pathname.startsWith('/') ? pathname.slice(1) : pathname
  } catch {
    return null
  }
}
