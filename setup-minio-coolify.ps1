# MinIO Setup Script for Coolify
# This script automates MinIO service creation on Coolify

$COOLIFY_URL = "http://46.224.248.228:8000"
$COOLIFY_PASSWORD = "vnLcuuxhCWrAkLLupCNf"
$PROJECT_UUID = "rsg4w0ogssskosooko80g4ws"
$ENVIRONMENT_UUID = "jgoc08cwccgwkw800oogss8g"

# MinIO Configuration
$MINIO_ROOT_USER = "petfendy_admin"
$MINIO_ROOT_PASSWORD = "PetF3ndy2024!MinIO#Secure"
$MINIO_SERVICE_NAME = "petfendy-minio"
$BUCKET_NAME = "petfendy"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "MinIO Coolify Setup Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to Coolify
Write-Host "[1/6] Logging in to Coolify..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@example.com"  # Default Coolify admin
    password = $COOLIFY_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$COOLIFY_URL/api/v1/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Login successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed. Trying alternative method..." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    
    # Alternative: Try to get token from settings
    Write-Host ""
    Write-Host "Please create an API token manually:" -ForegroundColor Yellow
    Write-Host "1. Go to: $COOLIFY_URL/security/api-tokens" -ForegroundColor White
    Write-Host "2. Click 'Create Token'" -ForegroundColor White
    Write-Host "3. Copy the token and paste it here" -ForegroundColor White
    Write-Host ""
    $token = Read-Host "Enter your Coolify API token"
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 2: Create MinIO Service
Write-Host ""
Write-Host "[2/6] Creating MinIO service..." -ForegroundColor Yellow

$minioServiceBody = @{
    type = "service"
    name = $MINIO_SERVICE_NAME
    description = "MinIO S3-compatible storage for Petfendy"
    service_type = "minio"
    environment_name = $ENVIRONMENT_UUID
    project_uuid = $PROJECT_UUID
    minio_root_user = $MINIO_ROOT_USER
    minio_root_password = $MINIO_ROOT_PASSWORD
    instant_deploy = $true
} | ConvertTo-Json

try {
    $serviceResponse = Invoke-RestMethod -Uri "$COOLIFY_URL/api/v1/services" -Method Post -Headers $headers -Body $minioServiceBody
    $serviceUuid = $serviceResponse.uuid
    Write-Host "✓ MinIO service created: $serviceUuid" -ForegroundColor Green
} catch {
    Write-Host "✗ Service creation failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps required:" -ForegroundColor Yellow
    Write-Host "1. Go to: $COOLIFY_URL/project/$PROJECT_UUID/environment/$ENVIRONMENT_UUID/new" -ForegroundColor White
    Write-Host "2. Select 'Service' → 'MinIO'" -ForegroundColor White
    Write-Host "3. Service Name: $MINIO_SERVICE_NAME" -ForegroundColor White
    Write-Host "4. Root User: $MINIO_ROOT_USER" -ForegroundColor White
    Write-Host "5. Root Password: $MINIO_ROOT_PASSWORD" -ForegroundColor White
    Write-Host "6. Click 'Deploy'" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Have you created the MinIO service manually? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
    
    $serviceUuid = Read-Host "Enter the MinIO service UUID (from URL)"
}

# Step 3: Wait for deployment
Write-Host ""
Write-Host "[3/6] Waiting for MinIO to deploy (this may take 1-2 minutes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60
Write-Host "✓ Deployment should be complete" -ForegroundColor Green

# Step 4: Get MinIO endpoints
Write-Host ""
Write-Host "[4/6] Getting MinIO endpoints..." -ForegroundColor Yellow

try {
    $serviceDetails = Invoke-RestMethod -Uri "$COOLIFY_URL/api/v1/services/$serviceUuid" -Method Get -Headers $headers
    $minioConsoleUrl = $serviceDetails.console_url
    $minioApiUrl = $serviceDetails.api_url
    
    Write-Host "✓ MinIO Console: $minioConsoleUrl" -ForegroundColor Green
    Write-Host "✓ MinIO API: $minioApiUrl" -ForegroundColor Green
} catch {
    Write-Host "! Could not fetch endpoints automatically" -ForegroundColor Yellow
    Write-Host "Please check Coolify UI for MinIO URLs" -ForegroundColor Yellow
    
    $minioApiUrl = Read-Host "Enter MinIO API URL (e.g. http://46.224.248.228:9000)"
    $minioConsoleUrl = Read-Host "Enter MinIO Console URL (optional press Enter to skip)"
}

# Step 5: Configure bucket (manual step required)
Write-Host ""
Write-Host "[5/6] Bucket configuration..." -ForegroundColor Yellow
Write-Host "Please configure the bucket manually:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open MinIO Console: $minioConsoleUrl" -ForegroundColor White
Write-Host "2. Login with:" -ForegroundColor White
Write-Host "   Username: $MINIO_ROOT_USER" -ForegroundColor Cyan
Write-Host "   Password: $MINIO_ROOT_PASSWORD" -ForegroundColor Cyan
Write-Host "3. Go to 'Buckets' → 'Create Bucket'" -ForegroundColor White
Write-Host "4. Bucket Name: $BUCKET_NAME" -ForegroundColor Cyan
Write-Host "5. Click 'Create Bucket'" -ForegroundColor White
Write-Host "6. Click on '$BUCKET_NAME' → 'Access' → 'Add Access Rule'" -ForegroundColor White
Write-Host "7. Set Prefix: * and Access: readonly" -ForegroundColor White
Write-Host ""

$bucketCreated = Read-Host "Have you created and configured the bucket? (y/n)"
if ($bucketCreated -ne "y") {
    Write-Host "! Please complete bucket setup before continuing" -ForegroundColor Yellow
}

# Step 6: Update application environment variables
Write-Host ""
Write-Host "[6/6] Updating application environment variables..." -ForegroundColor Yellow

$envVars = @"

# MinIO / S3 Configuration
AWS_ACCESS_KEY_ID=$MINIO_ROOT_USER
AWS_SECRET_ACCESS_KEY=$MINIO_ROOT_PASSWORD
AWS_REGION=us-east-1
S3_BUCKET=$BUCKET_NAME
S3_ENDPOINT=$minioApiUrl
S3_PUBLIC_URL=$minioApiUrl/$BUCKET_NAME
"@

Write-Host ""
Write-Host "Add these environment variables to your Petfendy application:" -ForegroundColor Yellow
Write-Host $envVars -ForegroundColor Cyan
Write-Host ""

# Save to file
$envVars | Out-File -FilePath "minio-env-variables.txt" -Encoding UTF8
Write-Host "✓ Environment variables saved to: minio-env-variables.txt" -ForegroundColor Green

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "MinIO Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add the environment variables to your Petfendy application in Coolify" -ForegroundColor White
Write-Host "2. Restart the application" -ForegroundColor White
Write-Host "3. Test file upload functionality" -ForegroundColor White
Write-Host ""
Write-Host "MinIO Console: $minioConsoleUrl" -ForegroundColor Cyan
Write-Host "MinIO API: $minioApiUrl" -ForegroundColor Cyan
Write-Host ""
