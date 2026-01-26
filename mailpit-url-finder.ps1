# Coolify Mailpit URL Bulucu
# Bu script Coolify'da kurulu Mailpit servisinin gerçek URL'sini bulmanıza yardımcı olur

Write-Host "🔍 Coolify Mailpit URL Bulucu" -ForegroundColor Green

Write-Host "`n📋 Coolify'da Mailpit URL'sini Bulma Rehberi:" -ForegroundColor Yellow

Write-Host "`n1️⃣ Coolify Dashboard'a Gidin:" -ForegroundColor Cyan
Write-Host "   • Coolify web arayüzünüze giriş yapın" -ForegroundColor White
Write-Host "   • Sol menüden 'Applications' veya 'Services' seçin" -ForegroundColor White

Write-Host "`n2️⃣ Mailpit Servisini Bulun:" -ForegroundColor Cyan
Write-Host "   • Kurduğunuz Mailpit servisini listede bulun" -ForegroundColor White
Write-Host "   • Servis adı genellikle 'mailpit' veya benzeri olur" -ForegroundColor White

Write-Host "`n3️⃣ URL Bilgilerini Alın:" -ForegroundColor Cyan
Write-Host "   • Mailpit servisine tıklayın" -ForegroundColor White
Write-Host "   • 'Domains' veya 'URLs' bölümünü kontrol edin" -ForegroundColor White
Write-Host "   • Genellikle şu formatlardan biri olur:" -ForegroundColor White

Write-Host "`n🌐 Olası URL Formatları:" -ForegroundColor Magenta
Write-Host "   • http://46.224.248.228:8025 (IP + Port)" -ForegroundColor Cyan
Write-Host "   • http://mailpit-xyz.46.224.248.228.sslip.io (sslip.io)" -ForegroundColor Cyan
Write-Host "   • http://your-custom-domain.com:8025 (Custom domain)" -ForegroundColor Cyan

Write-Host "`n4️⃣ SMTP Bilgileri:" -ForegroundColor Cyan
Write-Host "   • Web UI Port: 8025 (varsayılan)" -ForegroundColor White
Write-Host "   • SMTP Port: 1025 (varsayılan)" -ForegroundColor White
Write-Host "   • SMTP Host: Web UI'daki domain'in aynısı (port olmadan)" -ForegroundColor White

# Kullanıcıdan bilgi al
Write-Host "`n📝 Lütfen Coolify'dan aldığınız bilgileri girin:" -ForegroundColor Yellow

$webUIUrl = Read-Host "Mailpit Web UI URL'si (örn: http://46.224.248.228:8025)"
$smtpHost = ""

if ($webUIUrl) {
    # URL'den SMTP host'u çıkar
    try {
        $uri = [System.Uri]$webUIUrl
        $smtpHost = $uri.Host
        Write-Host "✅ SMTP Host otomatik belirlendi: $smtpHost" -ForegroundColor Green
    } catch {
        $smtpHost = Read-Host "SMTP Host (örn: 46.224.248.228)"
    }
} else {
    $smtpHost = Read-Host "SMTP Host (örn: 46.224.248.228)"
    $webUIUrl = "http://${smtpHost}:8025"
}

# Test bağlantısı
Write-Host "`n🧪 Bağlantı Testi:" -ForegroundColor Cyan

if ($webUIUrl) {
    Write-Host "Web UI Test: $webUIUrl" -ForegroundColor White
    try {
        $response = Invoke-WebRequest -Uri $webUIUrl -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Web UI erişilebilir!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Web UI yanıt verdi ama durum kodu: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Web UI erişilemiyor: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Muhtemel nedenler:" -ForegroundColor Yellow
        Write-Host "   • Mailpit servisi çalışmıyor" -ForegroundColor White
        Write-Host "   • Port 8025 kapalı" -ForegroundColor White
        Write-Host "   • URL yanlış" -ForegroundColor White
    }
}

if ($smtpHost) {
    Write-Host "SMTP Test: $smtpHost`:1025" -ForegroundColor White
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($smtpHost, 1025)
        $tcpClient.Close()
        Write-Host "✅ SMTP portu erişilebilir!" -ForegroundColor Green
    } catch {
        Write-Host "❌ SMTP portu erişilemiyor: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Muhtemel nedenler:" -ForegroundColor Yellow
        Write-Host "   • Mailpit servisi çalışmıyor" -ForegroundColor White
        Write-Host "   • Port 1025 kapalı" -ForegroundColor White
        Write-Host "   • Firewall engelliyor" -ForegroundColor White
    }
}

# Environment variables oluştur
if ($smtpHost) {
    Write-Host "`n🔧 Environment Variables:" -ForegroundColor Green
    Write-Host "SMTP_HOST=$smtpHost" -ForegroundColor Cyan
    Write-Host "SMTP_PORT=1025" -ForegroundColor Cyan
    Write-Host "SMTP_SECURE=false" -ForegroundColor Cyan
    Write-Host "EMAIL_FROM=`"Petfendy <info@petfendy.com>`"" -ForegroundColor Cyan
    
    # .env.local dosyasını güncelle
    $updateEnv = Read-Host "`n📝 .env.local dosyasını güncellemek istiyor musunuz? (y/n)"
    if ($updateEnv -eq "y" -or $updateEnv -eq "Y") {
        $envContent = @"

# ===========================================
# Mailpit SMTP Configuration (Auto-detected)
# ===========================================
SMTP_HOST=$smtpHost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Petfendy <info@petfendy.com>"
MAILPIT_WEB_UI=$webUIUrl
"@
        
        $envFile = "petfendy/.env.local"
        Add-Content -Path $envFile -Value $envContent
        Write-Host "✅ .env.local dosyası güncellendi!" -ForegroundColor Green
    }
}

# Sonuç özeti
Write-Host "`n📊 Sonuç Özeti:" -ForegroundColor Magenta
Write-Host "Web UI URL: $webUIUrl" -ForegroundColor White
Write-Host "SMTP Host: $smtpHost" -ForegroundColor White
Write-Host "SMTP Port: 1025" -ForegroundColor White

Write-Host "`n🎯 Sonraki Adımlar:" -ForegroundColor Yellow
Write-Host "1. Web UI URL'sini tarayıcıda test edin" -ForegroundColor White
Write-Host "2. Petfendy uygulamasını yeniden başlatın" -ForegroundColor White
Write-Host "3. http://localhost:3000/api/test-email adresini test edin" -ForegroundColor White
Write-Host "4. İletişim formunu test edin" -ForegroundColor White

if ($webUIUrl) {
    Write-Host "`n🌐 Mailpit Web UI'ya erişmek için:" -ForegroundColor Green
    Write-Host "$webUIUrl" -ForegroundColor Cyan
}