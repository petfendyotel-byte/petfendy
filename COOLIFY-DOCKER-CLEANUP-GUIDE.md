# Coolify Docker Cleanup Guide
**Coolify Sunucusunda Docker Temizlik ve Bakım Rehberi**

## 🧹 Temizlik Script'leri Özeti

### 1. coolify-safe-cleanup-fixed.ps1
**En Güvenli Seçenek** - Aktif servisleri koruyarak temizlik yapar.

```powershell
# Dry run (sadece analiz)
.\coolify-safe-cleanup-fixed.ps1 -DryRun

# Gerçek temizlik
.\coolify-safe-cleanup-fixed.ps1
```

**Ne yapar:**
- ✅ Durmuş container'ları siler
- ✅ Dangling image'ları siler  
- ✅ Kullanılmayan volume'ları siler
- ✅ Docker build cache'i temizler
- 🛡️ Coolify, Petfendy, MinIO, Mailpit servislerini korur

### 2. coolify-docker-cleanup.ps1
**Kapsamlı Temizlik** - Daha agresif temizlik yapar.

```powershell
# Dry run (sadece analiz)
.\coolify-docker-cleanup.ps1 -DryRun

# Gerçek temizlik
.\coolify-docker-cleanup.ps1

# Force mode (onay istemez)
.\coolify-docker-cleanup.ps1 -Force
```

**Ne yapar:**
- 🧹 Tüm durmuş container'ları siler
- 🧹 Tüm kullanılmayan image'ları siler
- 🧹 Tüm kullanılmayan volume'ları siler
- 🧹 Tüm kullanılmayan network'leri siler
- 🧹 Docker sistem geneli temizlik

### 3. coolify-status-check.ps1
**Durum Kontrolü** - Sistem durumunu analiz eder.

```powershell
.\coolify-status-check.ps1
```

**Ne gösterir:**
- 📊 Sistem bilgileri (CPU, RAM, Disk)
- 🐳 Docker kaynak kullanımı
- 📦 Çalışan/durmuş container'lar
- 🖼️ Image'lar ve volume'lar
- 🔍 Temizlik önerileri

### 4. setup-auto-cleanup.ps1
**Otomatik Temizlik** - Zamanlanmış temizlik kurar.

```powershell
# Haftalık otomatik temizlik
.\setup-auto-cleanup.ps1 -Schedule weekly

# Günlük otomatik temizlik
.\setup-auto-cleanup.ps1 -Schedule daily

# Aylık otomatik temizlik
.\setup-auto-cleanup.ps1 -Schedule monthly
```

## 📋 Kullanım Senaryoları

### Senaryo 1: Rutin Bakım (Önerilen)
```powershell
# 1. Durum kontrolü yap
.\coolify-status-check.ps1

# 2. Güvenli temizlik yap
.\coolify-safe-cleanup-fixed.ps1 -DryRun
.\coolify-safe-cleanup-fixed.ps1

# 3. Sonucu kontrol et
.\coolify-status-check.ps1
```

### Senaryo 2: Disk Dolduğunda (Acil)
```powershell
# 1. Mevcut durumu kontrol et
.\coolify-status-check.ps1

# 2. Agresif temizlik yap
.\coolify-docker-cleanup.ps1 -DryRun
.\coolify-docker-cleanup.ps1

# 3. Servislerin durumunu kontrol et
docker ps
```

### Senaryo 3: Otomatik Bakım Kurulumu
```powershell
# Haftalık otomatik temizlik kur
.\setup-auto-cleanup.ps1 -Schedule weekly

# Log'ları takip et
ssh root@46.224.248.228 'tail -f /var/log/coolify-cleanup.log'
```

## ⚠️ Güvenlik Önlemleri

### Temizlik Öncesi Kontroller
1. **Aktif servisleri kontrol et**
   ```bash
   docker ps
   ```

2. **Önemli volume'ları tespit et**
   ```bash
   docker volume ls
   ```

3. **Backup durumunu kontrol et**
   - Database backup'ları güncel mi?
   - Önemli dosyalar yedeklendi mi?

### Korunması Gereken Servisler
- ✅ **Coolify** - Ana yönetim sistemi
- ✅ **Petfendy** - Ana uygulama
- ✅ **PostgreSQL** - Veritabanı
- ✅ **MinIO** - Dosya depolama
- ✅ **Mailpit** - Email test sistemi
- ✅ **Nginx** - Reverse proxy

## 📊 Disk Kullanım Analizi

### Disk Kullanımını Kontrol Et
```bash
# Genel disk kullanımı
df -h

# Docker kaynak kullanımı
docker system df

# En büyük dosyaları bul
du -h / | sort -rh | head -20
```

### Temizlik Etkisi Tahmini
| Temizlik Türü | Ortalama Kazanım | Risk Seviyesi |
|---------------|------------------|---------------|
| Durmuş Container'lar | 100-500 MB | Düşük |
| Dangling Image'lar | 500-2 GB | Düşük |
| Kullanılmayan Volume'lar | 1-5 GB | Orta |
| Build Cache | 500 MB-2 GB | Düşük |
| Sistem Geneli | 2-10 GB | Yüksek |

## 🔄 Otomatik Temizlik Konfigürasyonu

### Cron Job Zamanlamaları
```bash
# Her gün saat 02:00
0 2 * * * /usr/local/bin/coolify-auto-cleanup.sh

# Her Pazar saat 02:00 (Haftalık)
0 2 * * 0 /usr/local/bin/coolify-auto-cleanup.sh

# Her ayın 1'i saat 02:00 (Aylık)
0 2 1 * * /usr/local/bin/coolify-auto-cleanup.sh
```

### Log Rotasyon
```bash
# Log dosyası konumu
/var/log/coolify-cleanup.log

# Log rotasyon ayarları
/etc/logrotate.d/coolify-cleanup
```

## 🚨 Acil Durum Prosedürleri

### Yanlışlıkla Önemli Container Silindi
1. **Hemen Coolify'a git**
   ```
   http://46.224.248.228:8000
   ```

2. **Servisi yeniden deploy et**
   - Applications → Petfendy → Deploy

3. **Database bağlantısını kontrol et**
   ```bash
   docker logs petfendy-container-name
   ```

### Disk Tamamen Doldu
1. **Acil temizlik yap**
   ```bash
   docker system prune -a -f --volumes
   ```

2. **Log dosyalarını temizle**
   ```bash
   truncate -s 0 /var/log/*.log
   ```

3. **Geçici dosyaları sil**
   ```bash
   rm -rf /tmp/*
   ```

## 📈 Monitoring ve Alerting

### Önemli Metrikler
- **Disk Kullanımı**: %80 üzeri uyarı
- **Container Sayısı**: 50+ container uyarı
- **Image Boyutu**: 20GB+ uyarı
- **Volume Sayısı**: 100+ volume uyarı

### Monitoring Script'i
```bash
#!/bin/bash
# disk-monitor.sh

DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

if [ $DISK_USAGE -gt 80 ]; then
    echo "UYARI: Disk kullanımı %$DISK_USAGE"
    # Slack/email notification gönder
fi
```

## 🔧 Troubleshooting

### Yaygın Sorunlar

**1. Script çalışmıyor**
```powershell
# PowerShell execution policy kontrol et
Get-ExecutionPolicy
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**2. SSH bağlantısı başarısız**
```powershell
# SSH key'i kontrol et
ssh-keygen -t rsa -b 4096
ssh-copy-id root@46.224.248.228
```

**3. Container yeniden başlamıyor**
```bash
# Container log'larını kontrol et
docker logs container-name

# Manuel başlatma
docker start container-name
```

## 📞 Destek ve İletişim

### Acil Durum Kontakları
- **Sistem Yöneticisi**: [İletişim Bilgisi]
- **Geliştirici Ekibi**: [İletişim Bilgisi]

### Faydalı Komutlar
```bash
# Coolify durumu
systemctl status coolify

# Docker durumu  
systemctl status docker

# Sistem kaynakları
htop

# Disk analizi
ncdu /
```

---

**Son Güncelleme**: 27 Ocak 2025  
**Versiyon**: 1.0  
**Durum**: ✅ Production Ready

**💡 İpucu**: Bu script'leri düzenli olarak (haftalık) çalıştırarak sunucu performansını optimize tutabilirsiniz.