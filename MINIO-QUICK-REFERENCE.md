# 🚀 MinIO Hızlı Referans - Petfendy

## 📦 Servis Bilgileri

| Özellik | Değer |
|---------|-------|
| **Service Name** | `petfendy-minio` |
| **Root User** | `petfendy_admin` |
| **Root Password** | `PetF3ndy2024!MinIO#Secure` |
| **Bucket Name** | `petfendy` |
| **Region** | `us-east-1` |

---

## 🌐 URL'ler

| Servis | URL |
|--------|-----|
| **Coolify** | http://46.224.248.228:8000 |
| **MinIO Console** | http://46.224.248.228:9001 |
| **MinIO API** | http://46.224.248.228:9000 |
| **Petfendy** | http://petfendy.com |

**NOT:** MinIO URL'leri `sslip.io` formatında da olabilir.

---

## 🔐 Giriş Bilgileri

### Coolify
```
URL: http://46.224.248.228:8000
Password: vnLcuuxhCWrAkLLupCNf
```

### MinIO Console
```
URL: http://46.224.248.228:9001
Username: petfendy_admin
Password: PetF3ndy2024!MinIO#Secure
```

---

## 📝 Environment Variables

Petfendy application'ına eklenecek değişkenler:

```bash
# MinIO / S3 Configuration
AWS_ACCESS_KEY_ID=petfendy_admin
AWS_SECRET_ACCESS_KEY=PetF3ndy2024!MinIO#Secure
AWS_REGION=us-east-1
S3_BUCKET=petfendy
S3_ENDPOINT=http://46.224.248.228:9000
S3_PUBLIC_URL=http://46.224.248.228:9000/petfendy
```

**⚠️ ÖNEMLİ:** `S3_ENDPOINT` ve `S3_PUBLIC_URL` değerlerini kendi MinIO API URL'inle değiştir!

---

## ⚡ Hızlı Kurulum (5 Dakika)

### 1. MinIO Servisi Oluştur
```
Coolify → Resources → New → Service → MinIO
Service Name: petfendy-minio
Root User: petfendy_admin
Root Password: PetF3ndy2024!MinIO#Secure
→ Deploy
```

### 2. Bucket Oluştur
```
MinIO Console → Buckets → Create Bucket
Name: petfendy
→ Create Bucket
```

### 3. Bucket'ı Public Yap
```
petfendy bucket → Access → Add Access Rule
Prefix: *
Access: readonly
→ Save
```

### 4. Environment Variables Ekle
```
Coolify → Petfendy App → Environment Variables
→ Yukarıdaki değişkenleri ekle
→ Save
```

### 5. Restart
```
Coolify → Petfendy App → Restart
```

---

## 🧪 Test Komutları

### Test 1: MinIO Console
```
1. MinIO Console'a gir
2. Buckets → petfendy → Upload
3. Test resmi yükle
4. Dosyaya tıkla → Share → URL kopyala
5. Tarayıcıda aç → Resim görünmeli ✓
```

### Test 2: Petfendy App
```
1. http://petfendy.com → Admin Panel
2. Oda Ekle/Düzenle
3. Resim yükle
4. MinIO Console'da dosyayı kontrol et ✓
```

---

## 🔧 Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| **Access Denied** | Bucket policy kontrol et (readonly) |
| **Connection Refused** | MinIO service çalışıyor mu? |
| **Upload çalışmıyor** | Environment variables kontrol et |
| **Dosyalar görünmüyor** | S3_PUBLIC_URL ve bucket policy kontrol et |

---

## 📚 Dökümantasyon

| Dosya | Açıklama |
|-------|----------|
| **MINIO-QUICK-SETUP.md** | Detaylı kurulum rehberi (5 dakika) |
| **MINIO-CHECKLIST.md** | Adım adım kontrol listesi |
| **COOLIFY-MINIO-SETUP.md** | En detaylı rehber (tüm seçenekler) |
| **minio-config-reference.txt** | Tek sayfa referans kartı |
| **setup-minio-coolify.ps1** | PowerShell otomasyon scripti |

---

## 🎯 Hangi Dosyayı Kullanmalıyım?

### İlk Kez Kuruyorsan
→ **MINIO-QUICK-SETUP.md** (En basit, 5 dakika)

### Adım Adım İşaretlemek İstiyorsan
→ **MINIO-CHECKLIST.md** (Checkbox'lı liste)

### Tüm Detayları Görmek İstiyorsan
→ **COOLIFY-MINIO-SETUP.md** (En kapsamlı)

### Hızlı Bilgi Lazımsa
→ **MINIO-QUICK-REFERENCE.md** (Bu dosya!)

### Otomatik Kurulum İstiyorsan
→ **setup-minio-coolify.ps1** (PowerShell script)

---

## 💡 İpuçları

### Güvenlik
- ✅ Güçlü şifreler kullan
- ✅ HTTPS kullan (production'da)
- ✅ Access key'leri düzenli değiştir

### Performans
- ✅ CDN kullan (Cloudflare)
- ✅ Image optimization ekle
- ✅ Cache headers ayarla

### Backup
- ✅ Düzenli backup al
- ✅ Versioning aktif et
- ✅ Lifecycle policy ayarla

---

## 📞 Yardım Lazım mı?

Takıldığın adımı söyle, yardımcı olayım! 🚀

**Sık Sorulan Sorular:**
- MinIO service deploy olmuyor → Logs kontrol et
- Console'a giriş yapamıyorum → Username/password kontrol et
- Upload çalışmıyor → Environment variables kontrol et
- Dosyalar görünmüyor → Bucket policy kontrol et

---

## 🎉 Başarılar!

MinIO kurulumu için her şey hazır. Şimdi **MINIO-QUICK-SETUP.md** dosyasını aç ve başla! 💪

**Tahmini Süre:** 5-10 dakika  
**Zorluk:** Kolay  
**Gereksinimler:** Coolify erişimi

İyi çalışmalar! 🚀
