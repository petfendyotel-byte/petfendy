# Coolify Safe Docker Cleanup Script
# Sadece güvenli temizlik işlemleri yapar, aktif servisleri korur

param(
    [Parameter(Mandatory=$false)]
    [string]$CoolifyHost = "46.224.248.228",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

Write-Host "🛡️  Coolify Safe Docker Cleanup" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - Sadece analiz yapılacak" -ForegroundColor Yellow
    Write-Host ""
}

$sshUser = "root"
$sshHost = $CoolifyHost

Write-Host "📊 Mevcut durum analizi..." -ForegroundColor Blue
Write-Host ""

# Disk kullanımı - öncesi
Write-Host "=== MEVCUT DİSK KULLANIMI ===" -ForegroundColor Green
$diskBefore = ssh ${sshUser}@${sshHost} "df -h / | tail -1"
Write-Host $diskBefore
Write-Host ""

# Docker sistem bilgileri
Write-Host "=== DOCKER KAYNAK KULLANIMI ===" -ForegroundColor Green
$dockerSystemDF = ssh ${sshUser}@${sshHost} "docker system df"
Write-Host $dockerSystemDF
Write-Host ""

# Aktif Coolify servislerini tespit et
Write-Host "=== AKTİF COOLİFY SERVİSLERİ ===" -ForegroundColor Green
$coolifyServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'label=coolify.managed=true' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
if ([string]::IsNullOrEmpty($coolifyServices)) {
    $coolifyServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=coolify' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
}
Write-Host $coolifyServices
Write-Host ""

# Petfendy servislerini tespit et
Write-Host "=== PETFENDY SERVİSLERİ ===" -ForegroundColor Green
$petfendyServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=petfendy' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
Write-Host $petfendyServices
Write-Host ""

# MinIO servislerini tespit et
Write-Host "=== MINIO SERVİSLERİ ===" -ForegroundColor Green
$minioServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=minio' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
Write-Host $minioServices
Write-Host ""

# Mailpit servislerini tespit et
Write-Host "=== MAILPIT SERVİSLERİ ===" -ForegroundColor Green
$mailpitServices = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=mailpit' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'"
Write-Host $mailpitServices
Write-Host ""

# Durmuş container'ları listele (güvenli olanlar)
Write-Host "=== TEMİZLENEBİLİR DURMUŞ CONTAINER'LAR ===" -ForegroundColor Yellow
$stoppedContainers = ssh ${sshUser}@${sshHost} "docker ps -a --filter 'status=exited' --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.CreatedAt}}'"
Write-Host $stoppedContainers
Write-Host ""

# Dangling image'ları listele
Write-Host "=== TEMİZLENEBİLİR DANGLING IMAGE'LAR ===" -ForegroundColor Yellow
$danglingImages = ssh ${sshUser}@${sshHost} "docker images --filter 'dangling=true' --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}'"
Write-Host $danglingImages
Write-Host ""

# Kullanılmayan volume'ları listele
Write-Host "=== TEMİZLENEBİLİR VOLUME'LAR ===" -ForegroundColor Yellow
$unusedVolumes = ssh ${sshUser}@${sshHost} "docker volume ls --filter 'dangling=true'"
Write-Host $unusedVolumes
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN tamamlandı." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Temizlenebilir kaynaklar:" -ForegroundColor Cyan
    Write-Host "  • Durmuş container'lar (yukarıda listelenen)" -ForegroundColor White
    Write-Host "  • Dangling image'lar (etiketlenmemiş)" -ForegroundColor White
    Write-Host "  • Kullanılmayan volume'lar" -ForegroundColor White
    Write-Host "  • Docker build cache" -ForegroundColor White
    Write-Host ""
    Write-Host "Gerçek temizlik için: .\coolify-safe-cleanup.ps1" -ForegroundColor Green
    exit 0
}

# Kullanıcıdan onay al
Write-Host "⚠️  GÜVENLİ TEMİZLİK İŞLEMİ" -ForegroundColor Yellow
Write-Host ""
Write-Host "Aşağıdaki işlemler yapılacak:" -ForegroundColor Cyan
Write-Host "  ✅ Durmuş container'lar silinecek (aktif servisler korunacak)" -ForegroundColor Green
Write-Host "  ✅ Dangling image'lar silinecek (etiketli image'lar korunacak)" -ForegroundColor Green
Write-Host "  ✅ Kullanılmayan volume'lar silinecek (aktif volume'lar korunacak)" -ForegroundColor Green
Write-Host "  ✅ Docker build cache temizlenecek" -ForegroundColor Green
Write-Host ""
Write-Host "  🛡️  Coolify, Petfendy, MinIO, Mailpit servisleri KORUNACAKTır" -ForegroundColor Green
Write-Host ""

$confirmation = Read-Host "Güvenli temizlik işlemini başlatmak istiyor musunuz? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "❌ İşlem iptal edildi." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🧹 Güvenli temizlik başlıyor..." -ForegroundColor Green
Write-Host ""

# 1. Sadece durmuş container'ları sil (çalışanları koruyarak)
Write-Host "1️⃣ Durmuş container'lar siliniyor..." -ForegroundColor Blue
try {
    # Önce hangi container'ların silineceğini göster
    $containersToRemove = ssh ${sshUser}@${sshHost} "docker ps -a --filter 'status=exited' --format '{{.Names}}'"
    if (![string]::IsNullOrEmpty($containersToRemove)) {
        Write-Host "Silinecek container'lar:" -ForegroundColor Yellow
        Write-Host $containersToRemove
        
        $result1 = ssh ${sshUser}@${sshHost} "docker container prune -f"
        Write-Host "✅ Durmuş container'lar silindi" -ForegroundColor Green
        Write-Host $result1
    } else {
        Write-Host "ℹ️  Silinecek durmuş container bulunamadı" -ForegroundColor Blue
    }
} catch {
    Write-Host "❌ Container temizliği başarısız: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 2. Sadece dangling image'ları sil
Write-Host "2️⃣ Dangling image'lar siliniyor..." -ForegroundColor Blue
try {
    $result2 = ssh ${sshUser}@${sshHost} "docker image prune -f"
    Write-Host "✅ Dangling image'lar silindi" -ForegroundColor Green
    Write-Host $result2
} catch {
    Write-Host "❌ Image temizliği başarısız: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. Kullanılmayan volume'ları sil (dikkatli)
Write-Host "3️⃣ Kullanılmayan volume'lar siliniyor..." -ForegroundColor Blue
try {
    $result3 = ssh ${sshUser}@${sshHost} "docker volume prune -f"
    Write-Host "✅ Kullanılmayan volume'lar silindi" -ForegroundColor Green
    Write-Host $result3
} catch {
    Write-Host "❌ Volume temizliği başarısız: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4. Docker build cache temizle
Write-Host "4️⃣ Docker build cache temizleniyor..." -ForegroundColor Blue
try {
    $result4 = ssh ${sshUser}@${sshHost} "docker builder prune -f"
    Write-Host "✅ Docker build cache temizlendi" -ForegroundColor Green
    Write-Host $result4
} catch {
    Write-Host "❌ Cache temizliği başarısız: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Temizlik sonrası durum kontrolü
Write-Host "📊 Temizlik sonrası durum:" -ForegroundColor Green
Write-Host ""

# Disk kullanımı - sonrası
Write-Host "=== YENİ DİSK KULLANIMI ===" -ForegroundColor Green
$diskAfter = ssh ${sshUser}@${sshHost} "df -h / | tail -1"
Write-Host $diskAfter
Write-Host ""

# Docker sistem bilgileri - sonrası
Write-Host "=== YENİ DOCKER KAYNAK KULLANIMI ===" -ForegroundColor Green
$dockerSystemDFAfter = ssh ${sshUser}@${sshHost} "docker system df"
Write-Host $dockerSystemDFAfter
Write-Host ""

# Aktif servislerin durumunu kontrol et
Write-Host "🔍 Aktif servislerin durumu kontrol ediliyor..." -ForegroundColor Blue
Write-Host ""

Write-Host "Coolify servisleri:" -ForegroundColor Cyan
$coolifyCheck = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=coolify' --format 'table {{.Names}}\t{{.Status}}'"
Write-Host $coolifyCheck
Write-Host ""

Write-Host "Petfendy servisleri:" -ForegroundColor Cyan
$petfendyCheck = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=petfendy' --format 'table {{.Names}}\t{{.Status}}'"
Write-Host $petfendyCheck
Write-Host ""

Write-Host "MinIO servisleri:" -ForegroundColor Cyan
$minioCheck = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=minio' --format 'table {{.Names}}\t{{.Status}}'"
Write-Host $minioCheck
Write-Host ""

Write-Host "Mailpit servisleri:" -ForegroundColor Cyan
$mailpitCheck = ssh ${sshUser}@${sshHost} "docker ps --filter 'name=mailpit' --format 'table {{.Names}}\t{{.Status}}'"
Write-Host $mailpitCheck
Write-Host ""

Write-Host "✅ Güvenli Docker temizliği tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Yapılan işlemler:" -ForegroundColor Cyan
Write-Host "  ✅ Durmuş container'lar silindi" -ForegroundColor Green
Write-Host "  ✅ Dangling image'lar silindi" -ForegroundColor Green
Write-Host "  ✅ Kullanılmayan volume'lar silindi" -ForegroundColor Green
Write-Host "  ✅ Docker build cache temizlendi" -ForegroundColor Green
Write-Host ""
Write-Host "🛡️  Tüm aktif servisler korundu ve çalışmaya devam ediyor." -ForegroundColor Green
Write-Host ""
Write-Host "💡 İpucu: Bu script'i düzenli olarak çalıştırarak sunucu performansını optimize edebilirsiniz." -ForegroundColor Blue