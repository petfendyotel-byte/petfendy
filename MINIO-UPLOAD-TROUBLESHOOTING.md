# 🔧 MinIO Upload Sorun Giderme Rehberi

## 🎯 Problem: Yönetim panelinde resim yüklenmiyor

### Durum Analizi

Yönetim panelinde "oda düzenle" → "resim yükle" işlemi çalışmıyor. Resimler MinIO CDN'e yüklenmiyor.

---

## 🔍 Teşhis Adımları

### 1. MinIO Servis Durumu Kontrolü

**Coolify Dashboard'da kontrol et:**
```
URL: http://46.224.248.228:8000
→ Resources → petfendy-minio
→ Status: Running olmalı ✅
```

**Kontrol edilecekler:**
- [ ] MinIO servisi çalışıyor mu?
- [ ] Deploy başarılı mı?
- [ ] Herhangi bir hata var mı?

### 2. MinIO Console Erişimi

**MinIO Console'a giriş yap:**
```
URL: MinIO service sayfasından Console URL'ini al
Username: petfendy_admin
Password: PetF3ndy2024!MinIO#Secure
```

**Kontrol edilecekler:**
- [ ] Console'a giriş yapabiliyor musun?
- [ ] "petfendy" bucket'ı var mı?
- [ ] Bucket public (readonly) mu?

### 3. Environment Variables Kontrolü

**Petfendy application'da kontrol et:**
```bash
AWS_ACCESS_KEY_ID=petfendy_admin
AWS_SECRET_ACCESS_KEY=PetF3ndy2024!MinIO#Secure
AWS_REGION=us-east-1
S3_BUCKET=petfendy
S3_ENDPOINT=http://46.224.248.228:9000  # Veya sslip.io URL
S3_PUBLIC_URL=http://46.224.248.228:9000/petfendy
```

**Kontrol edilecekler:**
- [ ] Tüm değişkenler tanımlı mı?
- [ ] S3_ENDPOINT doğru mu?
- [ ] Application restart edildi mi?

### 4. Test Upload API

**Test endpoint'ini çağır:**
```bash
curl http://petfendy.com/api/test-upload
```

**Veya tarayıcıda:**
```
http://petfendy.com/api/test-upload
```

**Kontrol edilecekler:**
- [ ] s3Configured: true mu?
- [ ] connectionTest.status: success mu?
- [ ] Herhangi bir hata mesajı var mı?

---

## 🚨 Yaygın Hatalar ve Çözümleri

### Hata 1: ECONNREFUSED
```
Error: connect ECONNREFUSED 46.224.248.228:9000
```

**Sebep:** MinIO servisi erişilebilir değil.

**Çözüm:**
1. Coolify'da MinIO servisini kontrol et
2. Service'i restart et
3. Port 9000 açık mı kontrol et
4. Alternatif endpoint dene (sslip.io URL)

### Hata 2: InvalidAccessKeyId
```
Error: The AWS Access Key Id you provided does not exist
```

**Sebep:** Yanlış access key veya secret key.

**Çözüm:**
1. MinIO Console'da access key'leri kontrol et
2. Environment variables'ı kontrol et
3. Application'ı restart et

### Hata 3: NoSuchBucket
```
Error: The specified bucket does not exist
```

**Sebep:** "petfendy" bucket'ı yok.

**Çözüm:**
1. MinIO Console'a gir
2. "petfendy" bucket'ını oluştur
3. Bucket'ı public (readonly) yap

### Hata 4: Access Denied
```
Error: Access Denied
```

**Sebep:** Bucket public değil veya yanlış policy.

**Çözüm:**
1. MinIO Console → Buckets → petfendy → Access
2. Public read policy ekle:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {"AWS": ["*"]},
         "Action": ["s3:GetObject"],
         "Resource": ["arn:aws:s3:::petfendy/*"]
       }
     ]
   }
   ```

---

## 🔧 Adım Adım Çözüm

### Çözüm 1: MinIO Endpoint Güncelleme

MinIO'nun gerçek endpoint'ini bul ve güncelle:

1. **Coolify'da MinIO service'ine git**
2. **Endpoints bölümünden URL'leri kopyala**
3. **Environment variables'ı güncelle:**

```bash
# Eski (çalışmıyor)
S3_ENDPOINT=http://46.224.248.228:9000

# Yeni (Coolify'dan alınan)
S3_ENDPOINT=http://minio-api-xxx.46.224.248.228.sslip.io
S3_PUBLIC_URL=http://minio-api-xxx.46.224.248.228.sslip.io/petfendy
```

4. **Application'ı restart et**

### Çözüm 2: MinIO Servisi Yeniden Kurma

Eğer MinIO servisi çalışmıyorsa:

1. **Mevcut MinIO servisini sil**
2. **Yeni MinIO servisi oluştur:**
   - Service Name: `petfendy-minio`
   - Root User: `petfendy_admin`
   - Root Password: `PetF3ndy2024!MinIO#Secure`
3. **Deploy et ve bekle**
4. **Bucket oluştur ve public yap**
5. **Environment variables güncelle**

### Çözüm 3: Local Storage Fallback

MinIO çalışmıyorsa geçici olarak local storage kullan:

1. **Environment variables'dan MinIO ayarlarını kaldır:**
```bash
# Bu satırları comment out et veya sil
# AWS_ACCESS_KEY_ID=petfendy_admin
# AWS_SECRET_ACCESS_KEY=PetF3ndy2024!MinIO#Secure
# S3_ENDPOINT=http://46.224.248.228:9000
# S3_PUBLIC_URL=http://46.224.248.228:9000/petfendy
```

2. **Application'ı restart et**
3. **Upload test et** (local storage'a kaydedecek)

---

## 🧪 Test Senaryoları

### Test 1: API Test
```bash
# Test endpoint
curl http://petfendy.com/api/test-upload

# Beklenen sonuç:
{
  "success": true,
  "config": {
    "s3Configured": true,
    "connectionTest": {
      "status": "success"
    }
  }
}
```

### Test 2: Manuel Upload Test
1. Petfendy admin paneline gir
2. Oda düzenle sayfasını aç
3. Resim yükle butonuna tıkla
4. Küçük bir resim seç (< 1MB)
5. Console'da logları kontrol et

### Test 3: MinIO Console Test
1. MinIO Console'a gir
2. Buckets → petfendy
3. Manuel olarak dosya yükle
4. Public URL'i test et

---

## 📊 Durum Kontrol Listesi

### MinIO Servisi
- [ ] Coolify'da MinIO servisi çalışıyor
- [ ] MinIO Console'a erişim var
- [ ] "petfendy" bucket'ı mevcut
- [ ] Bucket public (readonly) policy'si var

### Application Ayarları
- [ ] Environment variables tanımlı
- [ ] S3_ENDPOINT doğru
- [ ] S3_PUBLIC_URL doğru
- [ ] Application restart edildi

### Test Sonuçları
- [ ] /api/test-upload başarılı
- [ ] connectionTest.status: success
- [ ] Manuel upload çalışıyor
- [ ] Yüklenen dosyalar erişilebilir

---

## 🚀 Hızlı Çözüm (5 Dakika)

Eğer acil çözüm gerekiyorsa:

1. **MinIO'yu atla, local storage kullan:**
```bash
# .env.local'dan MinIO ayarlarını kaldır
# Sadece bu satırları bırak:
SMTP_HOST=mailpit-dswcgkkcwkwsgwckggks0c48.46.224.248.228.sslip.io
SMTP_PORT=1025
SMTP_SECURE=false
EMAIL_FROM="Petfendy <info@petfendy.com>"
```

2. **Application'ı restart et**
3. **Upload test et** (local'e kaydedecek)
4. **MinIO'yu sonra düzelt**

---

## 📞 Yardım

Hangi adımda takıldın? Bana söyle:

1. **MinIO servisi çalışıyor mu?**
2. **Console'a giriş yapabiliyor musun?**
3. **Test endpoint ne diyor?**
4. **Console'da hangi hata mesajları var?**

Bu bilgileri ver, sorunu birlikte çözelim! 🚀

---

## 🎯 Sonraki Adımlar

Sorunu çözdükten sonra:

1. ✅ **Production'da test et**
2. ✅ **Backup stratejisi belirle**
3. ✅ **CDN ayarla** (Cloudflare)
4. ✅ **Monitoring ekle**
5. ✅ **Image optimization** ekle

Başarılar! 💪