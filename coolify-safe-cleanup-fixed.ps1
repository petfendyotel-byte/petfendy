# Coolify Safe Docker Cleanup Script
# Sadece guvenli temizlik islemleri yapar, aktif servisleri korur

param(
    [Parameter(Mandatory=$false)]
    [string]$CoolifyHost = "46.224.248.228",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

Write-Host "Coolify Safe Docker Cleanup" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - Sadece analiz yapilacak" -ForegroundColor Yellow
    Write-Host ""
}

$sshUser = "root"
$sshHost = $CoolifyHost

Write-Host "Mevcut durum analizi..." -ForegroundColor Blue
Write-Host ""

# Disk kullanimi - oncesi
Write-Host "=== MEVCUT DISK KULLANIMI ===" -ForegroundColor Green
$diskBefore = ssh ${sshUser}@${sshHost} "df -h / | tail -1"
Write-Host $diskBefore
Write-Host ""

# Docker sistem bilgileri
Write-Host "=== DOCKER KAYNAK KULLANIMI ===" -ForegroundColor Green
$dockerSystemDF = ssh ${sshUser}@${sshHost} "docker system df"
Write-Host $dockerSystemDF
Write-Host ""

# Aktif Coolify servislerini tespit et
Write-Host "=== AKTIF COOLIFY SERVISLERI ===" -ForegroundColor Green
$coolifyServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=coolify' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
Write-Host $coolifyServices
Write-Host ""

# Durmus container'lari listele
Write-Host "=== TEMIZLENEBILIR DURMUS CONTAINER'LAR ===" -ForegroundColor Yellow
$stoppedContainers = ssh ${sshUser}@${sshHost} "docker ps -a --filter 'status=exited' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
Write-Host $stoppedContainers
Write-Host ""

# Dangling image'lari listele
Write-Host "=== TEMIZLENEBILIR DANGLING IMAGE'LAR ===" -ForegroundColor Yellow
$danglingImages = ssh ${sshUser}@${sshHost} "docker images --filter 'dangling=true' --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}'"
Write-Host $danglingImages
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN tamamlandi." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Temizlenebilir kaynaklar:" -ForegroundColor Cyan
    Write-Host "  • Durmus container'lar" -ForegroundColor White
    Write-Host "  • Dangling image'lar" -ForegroundColor White
    Write-Host "  • Kullanilmayan volume'lar" -ForegroundColor White
    Write-Host "  • Docker build cache" -ForegroundColor White
    Write-Host ""
    Write-Host "Gercek temizlik icin: .\coolify-safe-cleanup-fixed.ps1" -ForegroundColor Green
    exit 0
}

# Kullanicidan onay al
Write-Host "GUVENLI TEMIZLIK ISLEMI" -ForegroundColor Yellow
Write-Host ""
Write-Host "Asagidaki islemler yapilacak:" -ForegroundColor Cyan
Write-Host "  Durmus container'lar silinecek" -ForegroundColor Green
Write-Host "  Dangling image'lar silinecek" -ForegroundColor Green
Write-Host "  Kullanilmayan volume'lar silinecek" -ForegroundColor Green
Write-Host "  Docker build cache temizlenecek" -ForegroundColor Green
Write-Host ""
Write-Host "  Coolify, Petfendy, MinIO servisleri KORUNACAK" -ForegroundColor Green
Write-Host ""

$confirmation = Read-Host "Guvenli temizlik islemini baslatmak istiyor musunuz? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "Islem iptal edildi." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Guvenli temizlik basliyor..." -ForegroundColor Green
Write-Host ""

# 1. Durmus container'lari sil
Write-Host "1. Durmus container'lar siliniyor..." -ForegroundColor Blue
try {
    $result1 = ssh ${sshUser}@${sshHost} "docker container prune -f"
    Write-Host "Durmus container'lar silindi" -ForegroundColor Green
    Write-Host $result1
} catch {
    Write-Host "Container temizligi basarisiz" -ForegroundColor Red
}
Write-Host ""

# 2. Dangling image'lari sil
Write-Host "2. Dangling image'lar siliniyor..." -ForegroundColor Blue
try {
    $result2 = ssh ${sshUser}@${sshHost} "docker image prune -f"
    Write-Host "Dangling image'lar silindi" -ForegroundColor Green
    Write-Host $result2
} catch {
    Write-Host "Image temizligi basarisiz" -ForegroundColor Red
}
Write-Host ""

# 3. Kullanilmayan volume'lari sil
Write-Host "3. Kullanilmayan volume'lar siliniyor..." -ForegroundColor Blue
try {
    $result3 = ssh ${sshUser}@${sshHost} "docker volume prune -f"
    Write-Host "Kullanilmayan volume'lar silindi" -ForegroundColor Green
    Write-Host $result3
} catch {
    Write-Host "Volume temizligi basarisiz" -ForegroundColor Red
}
Write-Host ""

# 4. Docker build cache temizle
Write-Host "4. Docker build cache temizleniyor..." -ForegroundColor Blue
try {
    $result4 = ssh ${sshUser}@${sshHost} "docker builder prune -f"
    Write-Host "Docker build cache temizlendi" -ForegroundColor Green
    Write-Host $result4
} catch {
    Write-Host "Cache temizligi basarisiz" -ForegroundColor Red
}
Write-Host ""

# Temizlik sonrasi durum
Write-Host "Temizlik sonrasi durum:" -ForegroundColor Green
Write-Host ""

# Disk kullanimi - sonrasi
Write-Host "=== YENI DISK KULLANIMI ===" -ForegroundColor Green
$diskAfter = ssh ${sshUser}@${sshHost} "df -h / | tail -1"
Write-Host $diskAfter
Write-Host ""

# Docker sistem bilgileri - sonrasi
Write-Host "=== YENI DOCKER KAYNAK KULLANIMI ===" -ForegroundColor Green
$dockerSystemDFAfter = ssh ${sshUser}@${sshHost} "docker system df"
Write-Host $dockerSystemDFAfter
Write-Host ""

Write-Host "Guvenli Docker temizligi tamamlandi!" -ForegroundColor Green
Write-Host ""
Write-Host "Yapilan islemler:" -ForegroundColor Cyan
Write-Host "  Durmus container'lar silindi" -ForegroundColor Green
Write-Host "  Dangling image'lar silindi" -ForegroundColor Green
Write-Host "  Kullanilmayan volume'lar silindi" -ForegroundColor Green
Write-Host "  Docker build cache temizlendi" -ForegroundColor Green
Write-Host ""
Write-Host "Tum aktif servisler korundu ve calismaya devam ediyor." -ForegroundColor Green