# 🗄️ Coolify MinIO (S3) Kurulumu - Petfendy

## Yeni Coolify Sunucusunda MinIO Kurulumu

### ADIM 1: Coolify'da MinIO Oluştur

1. **Coolify'a git**: http://46.224.248.228:8000
2. Sol menüden **"Resources"** tıkla
3. **"+ New"** → **"Service"** seç
4. **"MinIO"** ara ve seç
5. Şu bilgileri gir:

**Service Name:**
```
petfendy-minio
```

**Root User (Access Key):**
```
petfendy_admin
```

**Root Password (Secret Key):**
```
PetF3ndy2024!MinIO#Secure
```

6. **"Deploy"** tıkla
7. ⏳ 1-2 dakika bekle

---

### ADIM 2: MinIO Bilgilerini Al

Deploy bittikten sonra:

1. MinIO service'ine tıkla
2. **"Endpoints"** veya **"URLs"** bölümünü bul
3. Şu bilgileri not et:

**MinIO Console URL:**
```
http://minio-console-xxx.46.224.248.228.sslip.io
```

**MinIO API Endpoint:**
```
http://minio-api-xxx.46.224.248.228.sslip.io
```

veya

```
http://46.224.248.228:9000
```

---

### ADIM 3: MinIO Console'a Giriş Yap

1. MinIO Console URL'ini aç
2. Login:
   - **Username**: `petfendy_admin`
   - **Password**: `PetF3ndy2024!MinIO#Secure`

---

### ADIM 4: Bucket Oluştur

MinIO Console'da:

1. Sol menüden **"Buckets"** tıkla
2. **"Create Bucket"** tıkla
3. Bucket Name:
   ```
   petfendy
   ```
4. **"Create Bucket"** tıkla

---

### ADIM 5: Bucket'ı Public Yap

1. Oluşturduğun `petfendy` bucket'ına tıkla
2. **"Access"** veya **"Policies"** sekmesine git
3. **"Add Access Rule"** tıkla
4. Policy:
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
5. **"Save"** tıkla

**Veya basit yöntem:**
- Prefix: `*`
- Access: `readonly` veya `public`

---

### ADIM 6: Access Keys Oluştur (Opsiyonel)

Eğer farklı access key istiyorsan:

1. MinIO Console → **"Access Keys"**
2. **"Create Access Key"** tıkla
3. Access Key ve Secret Key'i kopyala
4. **"Create"** tıkla

---

### ADIM 7: Coolify Application'a Environment Variables Ekle

Petfendy application'ında Environment Variables ekle:

**AWS_ACCESS_KEY_ID:**
```
petfendy_admin
```

**AWS_SECRET_ACCESS_KEY:**
```
PetF3ndy2024!MinIO#Secure
```

**AWS_REGION:**
```
us-east-1
```
(MinIO için region önemli değil, herhangi biri olabilir)

**S3_BUCKET:**
```
petfendy
```

**S3_ENDPOINT:**
```
http://minio-api-xxx.46.224.248.228.sslip.io
```
veya
```
http://46.224.248.228:9000
```

**S3_PUBLIC_URL:**
```
http://minio-api-xxx.46.224.248.228.sslip.io/petfendy
```

---

### ADIM 8: Application'ı Restart Et

1. Coolify → Application → **"Restart"**
2. Veya yeni deploy et

---

## 🧪 Test Et

### Test 1: MinIO Console

1. MinIO Console'a giriş yap
2. Buckets → petfendy
3. Dosya yükle (test için)
4. Public URL'i kopyala ve tarayıcıda aç

### Test 2: Application'dan Upload

1. Petfendy uygulamasında dosya yükleme özelliğini kullan
2. Oda resmi yükle veya profil fotoğrafı yükle
3. MinIO Console'da dosyanın geldiğini kontrol et

---

## 🔧 Alternatif: Eski MinIO'dan Veri Taşıma

Eğer eski sunucuda MinIO varsa, verileri taşıyabiliriz:

### Yöntem 1: MinIO Client (mc) ile

**Eski sunucuda:**
```bash
mc alias set old-minio http://old-server:9000 ACCESS_KEY SECRET_KEY
mc alias set new-minio http://46.224.248.228:9000 petfendy_admin PetF3ndy2024!MinIO#Secure

# Bucket'ı kopyala
mc cp --recursive old-minio/petfendy new-minio/petfendy
```

### Yöntem 2: AWS CLI ile

```bash
# Eski MinIO'dan indir
aws s3 sync s3://petfendy ./backup --endpoint-url=http://old-server:9000

# Yeni MinIO'ya yükle
aws s3 sync ./backup s3://petfendy --endpoint-url=http://46.224.248.228:9000
```

---

## 🌐 Domain ile MinIO (Opsiyonel)

MinIO'ya özel domain eklemek için:

### Cloudflare'de:

**CNAME Record:**
```
Type: CNAME
Name: minio
Content: minio-api-xxx.46.224.248.228.sslip.io
Proxy: ON (🟠)
```

**S3_PUBLIC_URL güncelle:**
```
https://minio.petfendy.com/petfendy
```

---

## 📊 MinIO Ayarları Özeti

| Ayar | Değer |
|------|-------|
| Service Name | `petfendy-minio` |
| Root User | `petfendy_admin` |
| Root Password | `PetF3ndy2024!MinIO#Secure` |
| Bucket Name | `petfendy` |
| Region | `us-east-1` |
| Endpoint | `http://46.224.248.228:9000` |
| Public URL | `http://46.224.248.228:9000/petfendy` |

---

## 🆘 Sorun Giderme

### "Access Denied" Hatası

**Sebep:** Bucket policy yanlış veya eksik.

**Çözüm:**
1. MinIO Console → Buckets → petfendy → Access
2. Public read policy ekle

### "Connection Refused" Hatası

**Sebep:** MinIO container çalışmıyor veya port kapalı.

**Çözüm:**
1. Coolify'da MinIO service'ini kontrol et
2. Restart dene
3. Logs'u kontrol et

### "Invalid Endpoint" Hatası

**Sebep:** S3_ENDPOINT yanlış.

**Çözüm:**
1. MinIO API endpoint'ini doğru kopyala
2. `http://` veya `https://` ekle
3. Port numarasını kontrol et (9000)

---

## 💡 Öneriler

### Güvenlik:
- ✅ Güçlü şifreler kullan
- ✅ Access key'leri düzenli değiştir
- ✅ Sadece gerekli bucket'ları public yap

### Performans:
- ✅ CDN kullan (Cloudflare)
- ✅ Image optimization ekle
- ✅ Cache headers ayarla

### Backup:
- ✅ Düzenli backup al
- ✅ Versioning aktif et
- ✅ Lifecycle policy ayarla

---

## 🎯 Sonraki Adımlar

MinIO kurduktan sonra:

1. ✅ Test upload yap
2. ✅ Public URL'leri kontrol et
3. ✅ Eski dosyaları taşı (varsa)
4. ✅ CDN ayarla (Cloudflare)
5. ✅ Backup stratejisi belirle

---

## 📞 Yardım

Hangi adımda takıldın? Bana söyle, yardımcı olayım! 🚀
