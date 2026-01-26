# Petfendy + Mailpit Yapılandırma Script'i
# Mailpit URL'si: http://mailpit-dswcgkkcwkwsgwckggks0c48.46.224.248.228.sslip.io:8025

Write-Host "🐾 Petfendy + Mailpit Yapılandırması Başlıyor..." -ForegroundColor Green

# Mailpit bilgileri
$mailpitWebUI = "http://mailpit-dswcgkkcwkwsgwckggks0c48.46.224.248.228.sslip.io:8025"
$mailpitSMTP = "mailpit-dswcgkkcwkwsgwckggks0c48.46.224.248.228.sslip.io"

Write-Host "`n📧 Mailpit Bilgileri:" -ForegroundColor Yellow
Write-Host "Web UI: $mailpitWebUI" -ForegroundColor Cyan
Write-Host "SMTP Host: $mailpitSMTP" -ForegroundColor Cyan
Write-Host "SMTP Port: 1025" -ForegroundColor Cyan

# Environment variables oluştur
Write-Host "`n🔧 Environment Variables Oluşturuluyor..." -ForegroundColor Cyan

$envContent = @"

# ===========================================
# Mailpit SMTP Configuration (Configured)
# ===========================================
SMTP_HOST=$mailpitSMTP
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Petfendy <info@petfendy.com>"
MAILPIT_WEB_UI=$mailpitWebUI
"@

# .env.local dosyasına ekle
$envFile = "petfendy/.env.local"
if (Test-Path $envFile) {
    Write-Host "📝 Mevcut .env.local dosyasına ekleniyor..." -ForegroundColor Blue
    Add-Content -Path $envFile -Value $envContent
} else {
    Write-Host "📝 Yeni .env.local dosyası oluşturuluyor..." -ForegroundColor Blue
    Set-Content -Path $envFile -Value $envContent
}

Write-Host "✅ Environment variables eklendi!" -ForegroundColor Green

# Bağlantı testleri
Write-Host "`n🧪 Bağlantı Testleri..." -ForegroundColor Cyan

# Web UI testi
Write-Host "Web UI Test: $mailpitWebUI" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri $mailpitWebUI -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Mailpit Web UI erişilebilir!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Web UI yanıt verdi ama durum kodu: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Web UI erişilemiyor: $($_.Exception.Message)" -ForegroundColor Red
}

# SMTP port testi
Write-Host "SMTP Test: $mailpitSMTP`:1025" -ForegroundColor White
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect($mailpitSMTP, 1025)
    $tcpClient.Close()
    Write-Host "✅ SMTP portu erişilebilir!" -ForegroundColor Green
} catch {
    Write-Host "❌ SMTP portu erişilemiyor: $($_.Exception.Message)" -ForegroundColor Red
}

# Coolify environment variables rehberi
Write-Host "`n🚀 Coolify Deployment Rehberi:" -ForegroundColor Magenta
Write-Host "Coolify'da Petfendy uygulamanızın Environment Variables bölümüne şu değişkenleri ekleyin:" -ForegroundColor White
Write-Host ""
Write-Host "SMTP_HOST=$mailpitSMTP" -ForegroundColor Cyan
Write-Host "SMTP_PORT=1025" -ForegroundColor Cyan
Write-Host "SMTP_SECURE=false" -ForegroundColor Cyan
Write-Host "EMAIL_FROM=Petfendy <info@petfendy.com>" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ardından uygulamayı yeniden deploy edin." -ForegroundColor White

# Test email gönderme
function Send-TestEmail {
    Write-Host "`n📧 Test Email Gönderiliyor..." -ForegroundColor Cyan
    
    try {
        # Petfendy uygulamasının çalışıp çalışmadığını kontrol et
        $testUrl = "http://localhost:3000/api/test-email"
        $response = Invoke-RestMethod -Uri $testUrl -Method GET -TimeoutSec 15
        
        if ($response.success) {
            Write-Host "✅ Test email başarıyla gönderildi!" -ForegroundColor Green
            Write-Host "📧 Provider: $($response.emailResult.provider)" -ForegroundColor White
            Write-Host "🆔 Message ID: $($response.emailResult.id)" -ForegroundColor White
            
            Write-Host "`n🌐 Mailpit Web UI'da emaili kontrol edin:" -ForegroundColor Yellow
            Write-Host "$mailpitWebUI" -ForegroundColor Cyan
            
            # Web UI'yi otomatik aç
            $openBrowser = Read-Host "`n🌐 Mailpit Web UI'yi tarayıcıda açmak istiyor musunuz? (y/n)"
            if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
                Start-Process $mailpitWebUI
            }
        } else {
            Write-Host "❌ Test email gönderilemedi: $($response.error)" -ForegroundColor Red
            Write-Host "SMTP Config: $($response.smtpConfig | ConvertTo-Json)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Test email API'sine erişilemiyor." -ForegroundColor Yellow
        Write-Host "   Muhtemel nedenler:" -ForegroundColor White
        Write-Host "   • Petfendy uygulaması çalışmıyor (npm run dev)" -ForegroundColor White
        Write-Host "   • Port 3000 kullanımda değil" -ForegroundColor White
        Write-Host "   • Environment variables henüz yüklenmedi" -ForegroundColor White
        Write-Host ""
        Write-Host "   Uygulamayı başlattıktan sonra şu URL'yi test edin:" -ForegroundColor White
        Write-Host "   http://localhost:3000/api/test-email" -ForegroundColor Cyan
    }
}

# Test seçeneği sun
$testChoice = Read-Host "`n🧪 Test email göndermek istiyor musunuz? (y/n)"
if ($testChoice -eq "y" -or $testChoice -eq "Y") {
    Send-TestEmail
}

# Manuel test rehberi
Write-Host "`n📋 Manuel Test Rehberi:" -ForegroundColor Green
Write-Host "1. Petfendy uygulamasını başlatın: npm run dev" -ForegroundColor White
Write-Host "2. İletişim formunu test edin: http://localhost:3000/tr/iletisim" -ForegroundColor White
Write-Host "3. Test API'yi çağırın: http://localhost:3000/api/test-email" -ForegroundColor White
Write-Host "4. Mailpit'te emaili kontrol edin: $mailpitWebUI" -ForegroundColor White

# Faydalı linkler
Write-Host "`n📚 Faydalı Linkler:" -ForegroundColor Green
Write-Host "• Mailpit Web UI: $mailpitWebUI" -ForegroundColor Cyan
Write-Host "• Email Test API: http://localhost:3000/api/test-email" -ForegroundColor Cyan
Write-Host "• Petfendy İletişim: http://localhost:3000/tr/iletisim" -ForegroundColor Cyan
Write-Host "• Petfendy Admin: http://localhost:3000/tr/admin" -ForegroundColor Cyan

# Kurulum tamamlandı
Write-Host "`n✅ Mailpit + Petfendy Yapılandırması Tamamlandı!" -ForegroundColor Green
Write-Host "🎉 info@petfendy.com artık Mailpit'e bağlı!" -ForegroundColor Yellow

Write-Host "`n🔄 Sonraki Adımlar:" -ForegroundColor Magenta
Write-Host "1. Petfendy uygulamasını yeniden başlatın" -ForegroundColor White
Write-Host "2. Coolify'da environment variables'ları ekleyin" -ForegroundColor White
Write-Host "3. Test email gönderin" -ForegroundColor White
Write-Host "4. Mailpit Web UI'da kontrol edin" -ForegroundColor White