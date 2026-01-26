# Set MinIO Bucket Public Policy
# This script sets the bucket policy to allow public read access

$MINIO_ENDPOINT = "https://minio-c44o8cow04s804ss48soc4w4.46.224.248.228.sslip.io"
$ACCESS_KEY = "JTIufur386jHCyMy"
$SECRET_KEY = "ul8wzUgISnqFbrf1oN92q1cAtP8zioAS"
$BUCKET_NAME = "petfendy"

Write-Host "Setting bucket policy for: $BUCKET_NAME" -ForegroundColor Yellow
Write-Host ""

# Create bucket policy JSON
$policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::$BUCKET_NAME/*"]
    }
  ]
}
"@

# Save policy to file
$policy | Out-File -FilePath "bucket-policy.json" -Encoding UTF8 -NoNewline
Write-Host "Bucket policy created: bucket-policy.json" -ForegroundColor Green
Write-Host ""
Write-Host "Policy content:" -ForegroundColor Cyan
Write-Host $policy -ForegroundColor White
Write-Host ""

# Try to set policy using AWS CLI
Write-Host "Attempting to set bucket policy..." -ForegroundColor Yellow

$env:AWS_ACCESS_KEY_ID = $ACCESS_KEY
$env:AWS_SECRET_ACCESS_KEY = $SECRET_KEY

try {
    $result = aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json --endpoint-url $MINIO_ENDPOINT 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Success! Bucket is now public." -ForegroundColor Green
    } else {
        Write-Host "AWS CLI method failed. Trying alternative..." -ForegroundColor Yellow
        Write-Host "Error: $result" -ForegroundColor Red
    }
} catch {
    Write-Host "AWS CLI not found or error occurred." -ForegroundColor Red
    Write-Host ""
    Write-Host "MANUAL METHOD:" -ForegroundColor Yellow
    Write-Host "1. In MinIO Console, click on 'petfendy' bucket" -ForegroundColor White
    Write-Host "2. Look for 'Summary' tab" -ForegroundColor White
    Write-Host "3. Find 'Access Policy' section" -ForegroundColor White
    Write-Host "4. Click 'Edit' or pencil icon" -ForegroundColor White
    Write-Host "5. Paste this policy:" -ForegroundColor White
    Write-Host ""
    Write-Host $policy -ForegroundColor Cyan
    Write-Host ""
    Write-Host "6. Click 'Save'" -ForegroundColor White
}

Write-Host ""
Write-Host "Alternative: Use MinIO Console UI" -ForegroundColor Yellow
Write-Host "1. Go to: $MINIO_ENDPOINT" -ForegroundColor White
Write-Host "2. Buckets -> petfendy -> Summary" -ForegroundColor White
Write-Host "3. Access Policy -> Edit" -ForegroundColor White
Write-Host "4. Set to 'Public' or paste the policy above" -ForegroundColor White
