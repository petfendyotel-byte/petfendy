# Coolify Docker Cleanup Script
# Gereksiz Docker container'larını ve image'larını temizler

param(
    [Parameter(Mandatory=$false)]
    [string]$CoolifyHost = "46.224.248.228",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force = $false
)

Write-Host "🧹 Coolify Docker Cleanup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - Sadece analiz yapılacak, hiçbir şey silinmeyecek" -ForegroundColor Yellow
    Write-Host ""
}

# SSH bağlantısı için komutlar
$sshUser = "root"
$sshHost = $CoolifyHost

Write-Host "📊 Docker durumu analiz ediliyor..." -ForegroundColor Blue
Write-Host ""

# Docker sistem bilgilerini al
Write-Host "=== DOCKER SİSTEM BİLGİLERİ ===" -ForegroundColor Green
$dockerInfo = ssh ${sshUser}@${sshHost} "docker system df"
Write-Host $dockerInfo
Write-Host ""

# Çalışan container'ları listele
Write-Host "=== ÇALIŞAN CONTAINER'LAR ===" -ForegroundColor Green
$runningContainers = ssh ${sshUser}@${sshHost} "docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'"
Write-Host $runningContainers
Write-Host ""

# Durmuş container'ları listele
Write-Host "=== DURMUŞ CONTAINER'LAR ===" -ForegroundColor Yellow
$stoppedContainers = ssh ${sshUser}@${sshHost} "docker ps -a --filter 'status=exited' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
Write-Host $stoppedContainers
Write-Host ""

# Kullanılmayan image'ları listele
Write-Host "=== KULLANILMAYAN IMAGE'LAR ===" -ForegroundColor Yellow
$unusedImages = ssh ${sshUser}@${sshHost} "docker images --filter 'dangling=true' --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}'"
Write-Host $unusedImages
Write-Host ""

# Kullanılmayan volume'ları listele
Write-Host "=== KULLANILMAYAN VOLUME'LAR ===" -ForegroundColor Yellow
$unusedVolumes = ssh ${sshUser}@${sshHost} "docker volume ls --filter 'dangling=true'"
Write-Host $unusedVolumes
Write-Host ""

# Kullanılmayan network'leri listele
Write-Host "=== KULLANILMAYAN NETWORK'LER ===" -ForegroundColor Yellow
$unusedNetworks = ssh ${sshUser}@${sshHost} "docker network ls --filter 'type=custom' --format 'table {{.Name}}\t{{.Driver}}\t{{.Scope}}'"
Write-Host $unusedNetworks
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN tamamlandı. Gerçek temizlik için -DryRun parametresini kaldırın." -ForegroundColor Yellow
    exit 0
}

# Kullanıcıdan onay al
if (-not $Force) {
    Write-Host "⚠️  UYARI: Bu işlem geri alınamaz!" -ForegroundColor Red
    Write-Host "Aşağıdaki temizlik işlemleri yapılacak:" -ForegroundColor Yellow
    Write-Host "  • Durmuş container'lar silinecek" -ForegroundColor White
    Write-Host "  • Kullanılmayan image'lar silinecek" -ForegroundColor White
    Write-Host "  • Kullanılmayan volume'lar silinecek" -ForegroundColor White
    Write-Host "  • Kullanılmayan network'ler silinecek" -ForegroundColor White
    Write-Host "  • Docker cache temizlenecek" -ForegroundColor White
    Write-Host ""
    
    $confirmation = Read-Host "Devam etmek istiyor musunuz? (y/N)"
    if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
        Write-Host "❌ İşlem iptal edildi." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🧹 Temizlik başlıyor..." -ForegroundColor Green
Write-Host ""

# 1. Durmuş container'ları sil
Write-Host "1️⃣ Durmuş container'lar siliniyor..." -ForegroundColor Blue
try {
    $result1 = ssh ${sshUser}@${sshHost} "docker container prune -f"
    Write-Host "✅ Durmuş container'lar silindi" -ForegroundColor Green
    Write-Host $result1
} catch {
    Write-Host "❌ Container temizliği başarısız: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 2. Kullanılmayan image'ları sil
Write-Host "2️⃣ Kullanılmayan image'lar siliniyor..." -ForegroundColor Blue
try {
    $result2 = ssh ${sshUser}@${sshHost} "docker image prune -f"
    Write-Host "✅ Kullanılmayan image'lar silindi" -ForegroundColor Green
    Write-Host $result2
} catch {
    Write-Host "❌ Image temizliği başarısız: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. Kullanılmayan volume'ları sil
Write-Host "3️⃣ Kullanılmayan volume'lar siliniyor..." -ForegroundColor Blue
try {
    $result3 = ssh ${sshUser}@${sshHost} "docker volume prune -f"
    Write-Host "✅ Kullanılmayan volume'lar silindi" -ForegroundColor Green
    Write-Host $result3
} catch {
    Write-Host "❌ Volume temizliği başarısız: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4. Kullanılmayan network'leri sil
Write-Host "4️⃣ Kullanılmayan network'ler siliniyor..." -ForegroundColor Blue
try {
    $result4 = ssh ${sshUser}@${sshHost} "docker network prune -f"
    Write-Host "✅ Kullanılmayan network'ler silindi" -ForegroundColor Green
    Write-Host $result4
} catch {
    Write-Host "❌ Network temizliği başarısız: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 5. Docker cache temizle
Write-Host "5️⃣ Docker build cache temizleniyor..." -ForegroundColor Blue
try {
    $result5 = ssh ${sshUser}@${sshHost} "docker builder prune -f"
    Write-Host "✅ Docker build cache temizlendi" -ForegroundColor Green
    Write-Host $result5
} catch {
    Write-Host "❌ Cache temizliği başarısız: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 6. Sistem temizliği (agresif)
Write-Host "6️⃣ Sistem geneli temizlik yapılıyor..." -ForegroundColor Blue
try {
    $result6 = ssh ${sshUser}@${sshHost} "docker system prune -f"
    Write-Host "✅ Sistem temizliği tamamlandı" -ForegroundColor Green
    Write-Host $result6
} catch {
    Write-Host "❌ Sistem temizliği başarısız: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Temizlik sonrası durum
Write-Host "📊 Temizlik sonrası durum:" -ForegroundColor Green
$dockerInfoAfter = ssh ${sshUser}@${sshHost} "docker system df"
Write-Host $dockerInfoAfter
Write-Host ""

# Disk kullanımını kontrol et
Write-Host "💾 Disk kullanımı:" -ForegroundColor Green
$diskUsage = ssh ${sshUser}@${sshHost} "df -h /"
Write-Host $diskUsage
Write-Host ""

Write-Host "✅ Docker temizliği tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Özet:" -ForegroundColor Cyan
Write-Host "  • Durmuş container'lar silindi" -ForegroundColor White
Write-Host "  • Kullanılmayan image'lar silindi" -ForegroundColor White
Write-Host "  • Kullanılmayan volume'lar silindi" -ForegroundColor White
Write-Host "  • Kullanılmayan network'ler silindi" -ForegroundColor White
Write-Host "  • Docker cache temizlendi" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Not: Aktif Coolify servisleri etkilenmedi." -ForegroundColor Yellow
Write-Host ""

# Coolify servislerinin durumunu kontrol et
Write-Host "🔍 Coolify servislerinin durumu kontrol ediliyor..." -ForegroundColor Blue
$coolifyServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=coolify' --format 'table {{.Names}}\t{{.Status}}'"
Write-Host $coolifyServices
Write-Host ""

Write-Host "🎉 Temizlik işlemi başarıyla tamamlandı!" -ForegroundColor Green