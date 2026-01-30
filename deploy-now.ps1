# Manuel Coolify Deploy

Write-Host "🚀 Manuel Deploy Gerekli" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Otomatik deploy calismadi. Manuel deploy icin:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Coolify paneline git: http://46.224.248.228:8000" -ForegroundColor Green
Write-Host "2. Petfendy application'a tikla" -ForegroundColor Green  
Write-Host "3. 'Deploy' butonuna tikla" -ForegroundColor Green
Write-Host ""

Write-Host "Veya GitHub webhook kurulumu yap:" -ForegroundColor Blue
Write-Host "https://github.com/petfendyotel-byte/petfendy/settings/hooks" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Coolify panelini ac? (y/n)"
if ($choice -eq "y" -or $choice -eq "Y") {
    Start-Process "http://46.224.248.228:8000"
    Write-Host "✅ Coolify paneli acildi!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Deploy sonrasi kontrol: https://petfendy.com" -ForegroundColor Cyan