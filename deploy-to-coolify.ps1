# Petfendy - Coolify Deployment Script (PowerShell)
# Usage: .\deploy-to-coolify.ps1

Write-Host "🚀 Petfendy Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$COOLIFY_HOST = "46.224.248.228"
$COOLIFY_PORT = "8000"
$PROJECT_NAME = "petfendy"

Write-Host "📦 Step 1: Checking prerequisites..." -ForegroundColor Blue

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed" -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "❌ Not a git repository" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites OK" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Step 2: Committing changes..." -ForegroundColor Blue

# Add all changes
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    $commitMessage = "Deploy to Coolify - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "No changes to commit" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📤 Step 3: Pushing to repository..." -ForegroundColor Blue

# Get current branch
$currentBranch = git branch --show-current

# Push to remote
try {
    git push origin $currentBranch
    Write-Host "✅ Pushed to repository" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Push failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Step 4: Coolify Configuration" -ForegroundColor Blue
Write-Host ""
Write-Host "Now you need to configure Coolify manually:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: http://${COOLIFY_HOST}:${COOLIFY_PORT}" -ForegroundColor White
Write-Host "2. Login with your credentials" -ForegroundColor White
Write-Host "3. Create PostgreSQL database:" -ForegroundColor White
Write-Host "   - Name: petfendy-db" -ForegroundColor Gray
Write-Host "   - Database: petfendy" -ForegroundColor Gray
Write-Host "   - Username: petfendy_user" -ForegroundColor Gray
Write-Host "   - Password: PetF3ndy2024!Secure#DB" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Create Application:" -ForegroundColor White

# Get repository URL
$repoUrl = git remote get-url origin
Write-Host "   - Repository: $repoUrl" -ForegroundColor Gray
Write-Host "   - Branch: $currentBranch" -ForegroundColor Gray
Write-Host "   - Port: 3000" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Add Environment Variables (see COOLIFY-QUICK-START.md)" -ForegroundColor White
Write-Host ""
Write-Host "6. Click Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "✅ Deployment script completed" -ForegroundColor Green
Write-Host ""
Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - COOLIFY-QUICK-START.md" -ForegroundColor White
Write-Host "   - COOLIFY-STEP-BY-STEP.md" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
