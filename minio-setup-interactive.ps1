# MinIO Interactive Setup Script for Coolify
# This script guides you through MinIO setup step by step

$COOLIFY_URL = "http://46.224.248.228:8000"
$MINIO_ROOT_USER = "petfendy_admin"
$MINIO_ROOT_PASSWORD = "PetF3ndy2024!MinIO#Secure"
$BUCKET_NAME = "petfendy"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MinIO Interactive Setup - Petfendy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create MinIO Service
Write-Host "[STEP 1/7] Create MinIO Service" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open Coolify in your browser:" -ForegroundColor White
Write-Host "   $COOLIFY_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Go to: Resources -> + New -> Service -> MinIO" -ForegroundColor White
Write-Host ""
Write-Host "3. Enter these details:" -ForegroundColor White
Write-Host "   Service Name: petfendy-minio" -ForegroundColor Cyan
Write-Host "   Root User: $MINIO_ROOT_USER" -ForegroundColor Cyan
Write-Host "   Root Password: $MINIO_ROOT_PASSWORD" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Click 'Deploy' and wait 1-2 minutes" -ForegroundColor White
Write-Host ""
$step1 = Read-Host "Have you completed Step 1? (y/n)"
if ($step1 -ne "y") {
    Write-Host "Please complete Step 1 first!" -ForegroundColor Red
    exit 1
}

# Step 2: Get MinIO URLs
Write-Host ""
Write-Host "[STEP 2/7] Get MinIO URLs" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. In Coolify, click on the MinIO service you just created" -ForegroundColor White
Write-Host "2. Find the 'Domains' or 'URLs' section" -ForegroundColor White
Write-Host "3. You should see two URLs:" -ForegroundColor White
Write-Host "   - Console URL (for management)" -ForegroundColor White
Write-Host "   - API URL (for application)" -ForegroundColor White
Write-Host ""
$minioApiUrl = Read-Host "Enter MinIO API URL (e.g. http://46.224.248.228:9000)"
$minioConsoleUrl = Read-Host "Enter MinIO Console URL (e.g. http://46.224.248.228:9001)"

Write-Host ""
Write-Host "URLs saved:" -ForegroundColor Green
Write-Host "  API: $minioApiUrl" -ForegroundColor Cyan
Write-Host "  Console: $minioConsoleUrl" -ForegroundColor Cyan

# Step 3: Login to MinIO Console
Write-Host ""
Write-Host "[STEP 3/7] Login to MinIO Console" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open MinIO Console in your browser:" -ForegroundColor White
Write-Host "   $minioConsoleUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Login with:" -ForegroundColor White
Write-Host "   Username: $MINIO_ROOT_USER" -ForegroundColor Cyan
Write-Host "   Password: $MINIO_ROOT_PASSWORD" -ForegroundColor Cyan
Write-Host ""
$step3 = Read-Host "Have you logged in successfully? (y/n)"
if ($step3 -ne "y") {
    Write-Host "Please login to MinIO Console first!" -ForegroundColor Red
    exit 1
}

# Step 4: Create Bucket
Write-Host ""
Write-Host "[STEP 4/7] Create Bucket" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. In MinIO Console, click 'Buckets' in the left menu" -ForegroundColor White
Write-Host "2. Click 'Create Bucket' button" -ForegroundColor White
Write-Host "3. Bucket Name: $BUCKET_NAME" -ForegroundColor Cyan
Write-Host "4. Click 'Create Bucket'" -ForegroundColor White
Write-Host ""
$step4 = Read-Host "Have you created the bucket? (y/n)"
if ($step4 -ne "y") {
    Write-Host "Please create the bucket first!" -ForegroundColor Red
    exit 1
}

# Step 5: Make Bucket Public
Write-Host ""
Write-Host "[STEP 5/7] Make Bucket Public" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Click on the '$BUCKET_NAME' bucket" -ForegroundColor White
Write-Host "2. Go to 'Access' tab" -ForegroundColor White
Write-Host "3. Click 'Add Access Rule'" -ForegroundColor White
Write-Host "4. Enter:" -ForegroundColor White
Write-Host "   Prefix: *" -ForegroundColor Cyan
Write-Host "   Access: readonly" -ForegroundColor Cyan
Write-Host "5. Click 'Save'" -ForegroundColor White
Write-Host ""
$step5 = Read-Host "Have you made the bucket public? (y/n)"
if ($step5 -ne "y") {
    Write-Host "Please make the bucket public first!" -ForegroundColor Red
    exit 1
}

# Step 6: Prepare Environment Variables
Write-Host ""
Write-Host "[STEP 6/7] Add Environment Variables" -ForegroundColor Yellow
Write-Host ""

$envVars = @"
AWS_ACCESS_KEY_ID=$MINIO_ROOT_USER
AWS_SECRET_ACCESS_KEY=$MINIO_ROOT_PASSWORD
AWS_REGION=us-east-1
S3_BUCKET=$BUCKET_NAME
S3_ENDPOINT=$minioApiUrl
S3_PUBLIC_URL=$minioApiUrl/$BUCKET_NAME
"@

Write-Host "Copy these environment variables:" -ForegroundColor White
Write-Host ""
Write-Host $envVars -ForegroundColor Cyan
Write-Host ""

# Save to file
$envVars | Out-File -FilePath "minio-env-variables.txt" -Encoding UTF8
Write-Host "Environment variables saved to: minio-env-variables.txt" -ForegroundColor Green
Write-Host ""

Write-Host "Now add them to your Petfendy application:" -ForegroundColor White
Write-Host "1. Go to Coolify -> Petfendy Application" -ForegroundColor White
Write-Host "2. Find 'Environment Variables' section" -ForegroundColor White
Write-Host "3. Add each variable above" -ForegroundColor White
Write-Host "4. Click 'Save'" -ForegroundColor White
Write-Host ""
$step6 = Read-Host "Have you added the environment variables? (y/n)"
if ($step6 -ne "y") {
    Write-Host "Please add the environment variables first!" -ForegroundColor Red
    exit 1
}

# Step 7: Restart Application
Write-Host ""
Write-Host "[STEP 7/7] Restart Application" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. In Coolify, go to Petfendy Application" -ForegroundColor White
Write-Host "2. Click 'Restart' button" -ForegroundColor White
Write-Host "3. Wait 30 seconds" -ForegroundColor White
Write-Host ""
$step7 = Read-Host "Have you restarted the application? (y/n)"
if ($step7 -ne "y") {
    Write-Host "Please restart the application first!" -ForegroundColor Red
    exit 1
}

# Success!
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  MinIO Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration Summary:" -ForegroundColor Yellow
Write-Host "  Service: petfendy-minio" -ForegroundColor White
Write-Host "  Bucket: $BUCKET_NAME" -ForegroundColor White
Write-Host "  Console: $minioConsoleUrl" -ForegroundColor White
Write-Host "  API: $minioApiUrl" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test upload from MinIO Console" -ForegroundColor White
Write-Host "2. Test upload from Petfendy application" -ForegroundColor White
Write-Host "3. Run database migration: npx prisma db push" -ForegroundColor White
Write-Host ""
Write-Host "Environment variables saved to: minio-env-variables.txt" -ForegroundColor Cyan
Write-Host ""
