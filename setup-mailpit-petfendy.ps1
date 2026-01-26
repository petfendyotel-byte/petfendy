# Petfendy + Mailpit Kurulum Script'i
# Bu script Coolify'da Mailpit kurulumu sonrası Petfendy uygulamasını yapılandırır

Write-Host "🐾 Petfendy + Mailpit Kurulum Başlıyor..." -ForegroundColor Green

# Mailpit bilgilerini al
Write-Host "`n📧 Mailpit Bilgileri:" -ForegroundColor Yellow
$mailpitDomain = Read-Host "Mailpit SMTP domain (örn: smtp.petfendy.com)"
$mailpitWebUI = Read-Host "Mailpit Web UI URL (örn: http://mailpit.petfendy.com:8025)"

if ([string]::IsNullOrEmpty($mailpitDomain)) {
    $mailpitDomain = "localhost"
    Write-Host "⚠️  Varsayılan domain kullanılıyor: localhost" -ForegroundColor Yellow
}

# Environment variables oluştur
Write-Host "`n🔧 Environment Variables Oluşturuluyor..." -ForegroundColor Cyan

$envContent = @"
# ===========================================
# Mailpit SMTP Configuration
# ===========================================
SMTP_HOST=$mailpitDomain
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Petfendy <info@petfendy.com>"

# ===========================================
# Mailpit Web UI
# ===========================================
MAILPIT_WEB_UI=$mailpitWebUI
"@

# .env.local dosyasına ekle
$envFile = "petfendy/.env.local"
if (Test-Path $envFile) {
    Write-Host "📝 Mevcut .env.local dosyasına ekleniyor..." -ForegroundColor Blue
    Add-Content -Path $envFile -Value "`n$envContent"
} else {
    Write-Host "📝 Yeni .env.local dosyası oluşturuluyor..." -ForegroundColor Blue
    Set-Content -Path $envFile -Value $envContent
}

# Test email gönderme fonksiyonu
function Test-EmailConnection {
    Write-Host "`n🧪 Email Bağlantısı Test Ediliyor..." -ForegroundColor Cyan
    
    try {
        # Next.js uygulamasının çalışıp çalışmadığını kontrol et
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/test-email" -Method GET -TimeoutSec 10
        
        if ($response.success) {
            Write-Host "✅ Email test başarılı!" -ForegroundColor Green
            Write-Host "📧 SMTP Host: $($response.smtpConfig.host)" -ForegroundColor White
            Write-Host "🔌 SMTP Port: $($response.smtpConfig.port)" -ForegroundColor White
            Write-Host "📨 From: $($response.smtpConfig.from)" -ForegroundColor White
            
            if ($mailpitWebUI) {
                Write-Host "`n🌐 Mailpit Web UI'da emaili kontrol edin: $mailpitWebUI" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Email test başarısız: $($response.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "⚠️  Email test edilemedi. Uygulama çalışmıyor olabilir." -ForegroundColor Yellow
        Write-Host "   Uygulamayı başlattıktan sonra şu URL'yi test edin:" -ForegroundColor White
        Write-Host "   http://localhost:3000/api/test-email" -ForegroundColor Cyan
    }
}

# Coolify environment variables için rehber
Write-Host "`n🚀 Coolify Deployment Rehberi:" -ForegroundColor Magenta
Write-Host "1. Coolify'da Petfendy uygulamanızın Environment Variables bölümüne gidin" -ForegroundColor White
Write-Host "2. Şu değişkenleri ekleyin:" -ForegroundColor White
Write-Host "   SMTP_HOST=$mailpitDomain" -ForegroundColor Cyan
Write-Host "   SMTP_PORT=1025" -ForegroundColor Cyan
Write-Host "   SMTP_SECURE=false" -ForegroundColor Cyan
Write-Host "   EMAIL_FROM=Petfendy <info@petfendy.com>" -ForegroundColor Cyan
Write-Host "3. Uygulamayı yeniden deploy edin" -ForegroundColor White

# Test seçeneği sun
$testChoice = Read-Host "`n🧪 Email bağlantısını test etmek istiyor musunuz? (y/n)"
if ($testChoice -eq "y" -or $testChoice -eq "Y") {
    Test-EmailConnection
}

# Faydalı linkler
Write-Host "`n📚 Faydalı Linkler:" -ForegroundColor Green
Write-Host "• Mailpit Web UI: $mailpitWebUI" -ForegroundColor Cyan
Write-Host "• Email Test API: http://localhost:3000/api/test-email" -ForegroundColor Cyan
Write-Host "• Petfendy İletişim: http://localhost:3000/tr/iletisim" -ForegroundColor Cyan

# Kurulum tamamlandı
Write-Host "`n✅ Mailpit + Petfendy Kurulumu Tamamlandı!" -ForegroundColor Green
Write-Host "🎉 Artık info@petfendy.com adresi Mailpit'e bağlı!" -ForegroundColor Yellow

# Son kontroller
Write-Host "`n🔍 Son Kontroller:" -ForegroundColor Yellow
Write-Host "1. Mailpit servisi çalışıyor mu?" -ForegroundColor White
Write-Host "2. SMTP portu (1025) erişilebilir mi?" -ForegroundColor White
Write-Host "3. Petfendy uygulaması environment variables'ları aldı mı?" -ForegroundColor White
Write-Host "4. İletişim formu test edildi mi?" -ForegroundColor White

Write-Host "`nKurulum rehberi: MAILPIT-COOLIFY-SETUP.md dosyasını inceleyin." -ForegroundColor Blue