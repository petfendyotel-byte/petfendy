# Coolify Sunucu Durum Kontrolü
# Docker container'ları, disk kullanımı ve sistem durumunu kontrol eder

param(
    [Parameter(Mandatory=$false)]
    [string]$CoolifyHost = "46.224.248.228"
)

Write-Host "📊 Coolify Sunucu Durum Kontrolü" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$sshUser = "root"
$sshHost = $CoolifyHost

# Sistem bilgileri
Write-Host "=== SİSTEM BİLGİLERİ ===" -ForegroundColor Green
$systemInfo = ssh ${sshUser}@${sshHost} "uname -a; uptime"
Write-Host $systemInfo
Write-Host ""

# Disk kullanımı
Write-Host "=== DİSK KULLANIMI ===" -ForegroundColor Green
$diskUsage = ssh ${sshUser}@${sshHost} "df -h"
Write-Host $diskUsage
Write-Host ""

# Bellek kullanımı
Write-Host "=== BELLEK KULLANIMI ===" -ForegroundColor Green
$memoryUsage = ssh ${sshUser}@${sshHost} "free -h"
Write-Host $memoryUsage
Write-Host ""

# Docker sistem durumu
Write-Host "=== DOCKER SİSTEM DURUMU ===" -ForegroundColor Green
$dockerSystem = ssh ${sshUser}@${sshHost} "docker system df"
Write-Host $dockerSystem
Write-Host ""

# Çalışan container'lar
Write-Host "=== ÇALIŞAN CONTAINER'LAR ===" -ForegroundColor Green
$runningContainers = ssh ${sshUser}@${sshHost} "docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'"
Write-Host $runningContainers
Write-Host ""

# Coolify servisleri
Write-Host "=== COOLİFY SERVİSLERİ ===" -ForegroundColor Blue
$coolifyServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=coolify' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
if ([string]::IsNullOrEmpty($coolifyServices)) {
    Write-Host "❌ Coolify servisleri bulunamadı!" -ForegroundColor Red
} else {
    Write-Host $coolifyServices
}
Write-Host ""

# Petfendy servisleri
Write-Host "=== PETFENDY SERVİSLERİ ===" -ForegroundColor Blue
$petfendyServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=petfendy' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
if ([string]::IsNullOrEmpty($petfendyServices)) {
    Write-Host "⚠️  Petfendy servisleri bulunamadı" -ForegroundColor Yellow
} else {
    Write-Host $petfendyServices
}
Write-Host ""

# MinIO servisleri
Write-Host "=== MINIO SERVİSLERİ ===" -ForegroundColor Blue
$minioServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=minio' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
if ([string]::IsNullOrEmpty($minioServices)) {
    Write-Host "⚠️  MinIO servisleri bulunamadı" -ForegroundColor Yellow
} else {
    Write-Host $minioServices
}
Write-Host ""

# Mailpit servisleri
Write-Host "=== MAILPIT SERVİSLERİ ===" -ForegroundColor Blue
$mailpitServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=mailpit' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
if ([string]::IsNullOrEmpty($mailpitServices)) {
    Write-Host "⚠️  Mailpit servisleri bulunamadı" -ForegroundColor Yellow
} else {
    Write-Host $mailpitServices
}
Write-Host ""

# PostgreSQL servisleri
Write-Host "=== POSTGRESQL SERVİSLERİ ===" -ForegroundColor Blue
$postgresServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=postgres' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
if ([string]::IsNullOrEmpty($postgresServices)) {
    Write-Host "⚠️  PostgreSQL servisleri bulunamadı" -ForegroundColor Yellow
} else {
    Write-Host $postgresServices
}
Write-Host ""

# Durmuş container'lar
Write-Host "=== DURMUŞ CONTAINER'LAR ===" -ForegroundColor Yellow
$stoppedContainers = ssh ${sshUser}@${sshHost} "docker ps -a --filter 'status=exited' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
if ([string]::IsNullOrEmpty($stoppedContainers)) {
    Write-Host "✅ Durmuş container bulunamadı" -ForegroundColor Green
} else {
    Write-Host $stoppedContainers
}
Write-Host ""

# Dangling image'lar
Write-Host "=== DANGLING IMAGE'LAR ===" -ForegroundColor Yellow
$danglingImages = ssh ${sshUser}@${sshHost} "docker images --filter 'dangling=true' --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}'"
if ([string]::IsNullOrEmpty($danglingImages)) {
    Write-Host "✅ Dangling image bulunamadı" -ForegroundColor Green
} else {
    Write-Host $danglingImages
}
Write-Host ""

# Kullanılmayan volume'lar
Write-Host "=== KULLANILMAYAN VOLUME'LAR ===" -ForegroundColor Yellow
$unusedVolumes = ssh ${sshUser}@${sshHost} "docker volume ls --filter 'dangling=true'"
if ([string]::IsNullOrEmpty($unusedVolumes)) {
    Write-Host "✅ Kullanılmayan volume bulunamadı" -ForegroundColor Green
} else {
    Write-Host $unusedVolumes
}
Write-Host ""

# Network durumu
Write-Host "=== DOCKER NETWORK'LER ===" -ForegroundColor Blue
$dockerNetworks = ssh ${sshUser}@${sshHost} "docker network ls"
Write-Host $dockerNetworks
Write-Host ""

# Son temizlik log'u (varsa)
Write-Host "=== SON TEMİZLİK LOG'U ===" -ForegroundColor Blue
$lastCleanup = ssh ${sshUser}@${sshHost} "tail -20 /var/log/coolify-cleanup.log 2>/dev/null || echo 'Temizlik log dosyası bulunamadı'"
Write-Host $lastCleanup
Write-Host ""

# Cron job durumu
Write-Host "=== OTOMATIK TEMİZLİK DURUMU ===" -ForegroundColor Blue
$cronJobs = ssh ${sshUser}@${sshHost} "crontab -l 2>/dev/null | grep coolify-auto-cleanup || echo 'Otomatik temizlik kurulu değil'"
Write-Host $cronJobs
Write-Host ""

# Özet ve öneriler
Write-Host "📋 DURUM ÖZETİ VE ÖNERİLER" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Disk kullanımı analizi
$diskUsagePercent = ssh ${sshUser}@${sshHost} "df / | tail -1 | awk '{print `$5}' | sed 's/%//'"
$diskUsageNum = [int]$diskUsagePercent

if ($diskUsageNum -gt 90) {
    Write-Host "🔴 DİSK KULLANIMI KRİTİK: %$diskUsagePercent" -ForegroundColor Red
    Write-Host "   Acil temizlik gerekli!" -ForegroundColor Red
} 
elseif ($diskUsageNum -gt 80) {
    Write-Host "🟡 DİSK KULLANIMI YÜKSEK: %$diskUsagePercent" -ForegroundColor Yellow
    Write-Host "   Temizlik önerilir" -ForegroundColor Yellow
} 
else {
    Write-Host "🟢 DİSK KULLANIMI NORMAL: %$diskUsagePercent" -ForegroundColor Green
}

# Container durumu analizi
$totalContainers = ssh ${sshUser}@${sshHost} "docker ps -a --format '{{.Names}}' | wc -l"
$runningCount = ssh ${sshUser}@${sshHost} "docker ps --format '{{.Names}}' | wc -l"
$stoppedCount = ssh ${sshUser}@${sshHost} "docker ps -a --filter 'status=exited' --format '{{.Names}}' | wc -l"

Write-Host ""
Write-Host "Container İstatistikleri:" -ForegroundColor Cyan
Write-Host "  Toplam: $totalContainers" -ForegroundColor White
Write-Host "  Çalışan: $runningCount" -ForegroundColor Green
Write-Host "  Durmuş: $stoppedCount" -ForegroundColor Yellow

if ([int]$stoppedCount -gt 5) {
    Write-Host "  ⚠️  Çok fazla durmuş container var, temizlik önerilir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🛠️  HIZLI EYLEMLER:" -ForegroundColor Yellow
Write-Host "  Güvenli temizlik: .\coolify-safe-cleanup.ps1" -ForegroundColor White
Write-Host "  Otomatik temizlik kur: .\setup-auto-cleanup.ps1" -ForegroundColor White
Write-Host "  Agresif temizlik: .\coolify-docker-cleanup.ps1" -ForegroundColor White
Write-Host ""

Write-Host "✅ Durum kontrolü tamamlandı!" -ForegroundColor Green