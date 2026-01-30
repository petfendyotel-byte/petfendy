# Manuel Coolify Deploy
# Webhook olmadan manuel deploy tetikleme

Write-Host "🚀 Manuel Coolify Deploy" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Deploy seçenekleri:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Coolify Web Panel (Önerilen)" -ForegroundColor Green
Write-Host "   -> http://46.224.248.228:8000" -ForegroundColor White
Write-Host "   -> Petfendy application'ına git" -ForegroundColor White
Write-Host "   -> 'Deploy' butonuna tıkla" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  GitHub Webhook Kurulumu" -ForegroundColor Blue
Write-Host "   -> GitHub: https://github.com/petfendyotel-byte/petfendy/settings/hooks" -ForegroundColor White
Write-Host "   -> 'Add webhook' tıkla" -ForegroundColor White
Write-Host "   -> Coolify'dan webhook URL'ini al ve ekle" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  API Token ile Deploy" -ForegroundColor Magenta
Write-Host "   -> Coolify -> Profile -> API Tokens" -ForegroundColor White
Write-Host "   -> Token oluştur ve şu komutu çalıştır:" -ForegroundColor White
Write-Host "   -> .\coolify-api-deploy.ps1 -ApiToken 'YOUR_TOKEN'" -ForegroundColor White
Write-Host ""

Write-Host "🔍 Şu anda en hızlı yöntem: Coolify web panelinden manuel deploy" -ForegroundColor Cyan
Write-Host ""

# Coolify panelini aç
$choice = Read-Host "Coolify panelini tarayıcıda açmak ister misin? (y/n)"
if ($choice -eq "y" -or $choice -eq "Y") {
    Start-Process "http://46.224.248.228:8000"
    Write-Host "✅ Coolify paneli açıldı!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Deploy sonrası kontrol:" -ForegroundColor Yellow
Write-Host "   -> https://petfendy.com (footer'da İyzico logosu olmalı)" -ForegroundColor White
Write-Host ""