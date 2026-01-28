# Coolify Otomatik Temizlik Kurulumu
# Sunucuda otomatik Docker temizliği için cron job kurar

param(
    [Parameter(Mandatory=$false)]
    [string]$CoolifyHost = "46.224.248.228",
    
    [Parameter(Mandatory=$false)]
    [string]$Schedule = "weekly" # daily, weekly, monthly
)

Write-Host "⏰ Coolify Otomatik Temizlik Kurulumu" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$sshUser = "root"
$sshHost = $CoolifyHost

# Cron schedule'ları
$cronSchedules = @{
    "daily" = "0 2 * * *"      # Her gün saat 02:00
    "weekly" = "0 2 * * 0"     # Her Pazar saat 02:00
    "monthly" = "0 2 1 * *"    # Her ayın 1'i saat 02:00
}

if (-not $cronSchedules.ContainsKey($Schedule)) {
    Write-Host "❌ Geçersiz schedule: $Schedule" -ForegroundColor Red
    Write-Host "Geçerli seçenekler: daily, weekly, monthly" -ForegroundColor Yellow
    exit 1
}

$cronTime = $cronSchedules[$Schedule]

Write-Host "📅 Seçilen zamanlama: $Schedule ($cronTime)" -ForegroundColor Green
Write-Host ""

# Sunucuda temizlik script'i oluştur
Write-Host "📝 Sunucuda temizlik script'i oluşturuluyor..." -ForegroundColor Blue

$cleanupScript = @"
#!/bin/bash
# Coolify Otomatik Docker Temizlik Script'i
# Oluşturulma: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

echo "🧹 Coolify Docker Otomatik Temizlik - \$(date)"
echo "================================================"

# Log dosyası
LOG_FILE="/var/log/coolify-cleanup.log"
exec > >(tee -a \$LOG_FILE)
exec 2>&1

echo "Temizlik başlıyor..."

# 1. Durmuş container'ları sil
echo "1. Durmuş container'lar siliniyor..."
docker container prune -f

# 2. Dangling image'ları sil
echo "2. Dangling image'lar siliniyor..."
docker image prune -f

# 3. Kullanılmayan volume'ları sil
echo "3. Kullanılmayan volume'lar siliniyor..."
docker volume prune -f

# 4. Docker build cache temizle
echo "4. Docker build cache temizleniyor..."
docker builder prune -f

# 5. Disk kullanımını logla
echo "5. Disk kullanımı:"
df -h /

echo "6. Docker kaynak kullanımı:"
docker system df

echo "✅ Otomatik temizlik tamamlandı - \$(date)"
echo "================================================"
echo ""
"@

# Script'i sunucuya yükle
Write-Host "Temizlik script'i sunucuya yükleniyor..." -ForegroundColor Blue
$cleanupScript | ssh ${sshUser}@${sshHost} "cat > /usr/local/bin/coolify-auto-cleanup.sh"

# Script'i çalıştırılabilir yap
ssh ${sshUser}@${sshHost} "chmod +x /usr/local/bin/coolify-auto-cleanup.sh"

Write-Host "✅ Temizlik script'i oluşturuldu: /usr/local/bin/coolify-auto-cleanup.sh" -ForegroundColor Green
Write-Host ""

# Cron job ekle
Write-Host "⏰ Cron job ekleniyor..." -ForegroundColor Blue

# Mevcut crontab'ı al ve yeni job ekle
$cronJob = "$cronTime /usr/local/bin/coolify-auto-cleanup.sh"

ssh ${sshUser}@${sshHost} @"
# Mevcut crontab'ı yedekle
crontab -l > /tmp/crontab.backup 2>/dev/null || true

# Coolify cleanup job'ını kaldır (varsa)
crontab -l 2>/dev/null | grep -v 'coolify-auto-cleanup' > /tmp/crontab.new || true

# Yeni job'ı ekle
echo '$cronJob' >> /tmp/crontab.new

# Yeni crontab'ı yükle
crontab /tmp/crontab.new

# Temizlik
rm -f /tmp/crontab.new

echo "Cron job eklendi:"
crontab -l | grep coolify-auto-cleanup
"@

Write-Host "✅ Cron job eklendi" -ForegroundColor Green
Write-Host ""

# Log rotasyon ayarla
Write-Host "📋 Log rotasyon ayarlanıyor..." -ForegroundColor Blue

$logrotateConfig = @"
/var/log/coolify-cleanup.log {
    weekly
    rotate 4
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
"@

$logrotateConfig | ssh ${sshUser}@${sshHost} "cat > /etc/logrotate.d/coolify-cleanup"

Write-Host "✅ Log rotasyon ayarlandı" -ForegroundColor Green
Write-Host ""

# Test çalıştırması
Write-Host "🧪 Test çalıştırması yapılıyor..." -ForegroundColor Blue
ssh ${sshUser}@${sshHost} "/usr/local/bin/coolify-auto-cleanup.sh"

Write-Host ""
Write-Host "✅ Otomatik temizlik kurulumu tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Kurulum Özeti:" -ForegroundColor Cyan
Write-Host "  📅 Zamanlama: $Schedule ($cronTime)" -ForegroundColor White
Write-Host "  📝 Script: /usr/local/bin/coolify-auto-cleanup.sh" -ForegroundColor White
Write-Host "  📋 Log: /var/log/coolify-cleanup.log" -ForegroundColor White
Write-Host "  ⏰ Cron Job: Aktif" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Kontrol Komutları:" -ForegroundColor Yellow
Write-Host "  Cron job'ları görüntüle: ssh root@$CoolifyHost 'crontab -l'" -ForegroundColor White
Write-Host "  Log'ları görüntüle: ssh root@$CoolifyHost 'tail -f /var/log/coolify-cleanup.log'" -ForegroundColor White
Write-Host "  Manuel çalıştır: ssh root@$CoolifyHost '/usr/local/bin/coolify-auto-cleanup.sh'" -ForegroundColor White
Write-Host ""
Write-Host "💡 İpucu: Log dosyasını düzenli olarak kontrol ederek temizlik işlemlerini takip edebilirsiniz." -ForegroundColor Blue