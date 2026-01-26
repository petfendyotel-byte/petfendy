# 🚀 MinIO Hızlı Kurulum - Petfendy

## Adım Adım MinIO Kurulumu (5 Dakika)

### 1️⃣ MinIO Servisi Oluştur

**Coolify'a git:**
```
http://46.224.248.228:8000/project/rsg4w0ogssskosooko80g4ws/environment/jgoc08cwccgwkw800oogss8g/new
```

**Seçimler:**
1. **"Service"** seç
2. **"MinIO"** ara ve seç
3. Bilgileri gir:

```
Service Name: petfendy-minio
Root User: petfendy_admin
Root Password: PetF3ndy2024!MinIO#Secure
```

4. **"Deploy"** tıkla
5. ⏳ 1-2 dakika bekle

---

### 2️⃣ MinIO URL'lerini Al

Deploy bittikten sonra:

1. MinIO service'ine tıkla
2. **"Domains"** veya **"URLs"** bölümünü bul
3. İki URL göreceksin:
   - **Console URL** (MinIO yönetim paneli)
   - **API URL** (Uygulama için)

**Örnek:**
```
Console: http://minio-console-xxx.46.224.248.228.sslip.io
API: http://minio-api-xxx.46.224.248.228.sslip.io
```

veya

```
Console: http://46.224.248.228:9001
API: http://46.224.248.228:9000
```

---

### 3️⃣ Bucket Oluştur

**MinIO Console'a gir:**
1. Console URL'ini aç
2. Login:
   - Username: `petfendy_admin`
   - Password: `PetF3ndy2024!MinIO#Secure`

**Bucket oluştur:**
1. Sol menü → **"Buckets"**
2. **"Create Bucket"** tıkla
3. Name: `petfendy`
4. **"Create Bucket"** tıkla

**Public yap:**
1. `petfendy` bucket'ına tıkla
2. **"Access"** sekmesi
3. **"Add Access Rule"** tıkla
4. Prefix: `*`
5. Access: **"readonly"** seç
6. **"Save"** tıkla

---

### 4️⃣ Environment Variables Ekle

**Petfendy application'ına git:**
```
http://46.224.248.228:8000/project/rsg4w0ogssskosooko80g4ws/environment/jgoc08cwccgwkw800oogss8g
```

**Environment Variables ekle:**

```bash
# MinIO / S3 Configuration
AWS_ACCESS_KEY_ID=petfendy_admin
AWS_SECRET_ACCESS_KEY=PetF3ndy2024!MinIO#Secure
AWS_REGION=us-east-1
S3_BUCKET=petfendy
S3_ENDPOINT=http://46.224.248.228:9000
S3_PUBLIC_URL=http://46.224.248.228:9000/petfendy
```

**NOT:** `S3_ENDPOINT` ve `S3_PUBLIC_URL` değerlerini kendi MinIO API URL'inle değiştir!

---

### 5️⃣ Application'ı Restart Et

1. Coolify → Petfendy Application
2. **"Restart"** tıkla
3. ⏳ 30 saniye bekle

---

## ✅ Test Et

### Test 1: MinIO Console'dan

1. MinIO Console'a gir
2. Buckets → petfendy
3. **"Upload"** tıkla
4. Bir resim yükle
5. Dosyaya tıkla → **"Share"** → URL'i kopyala
6. Tarayıcıda aç → Resim görünmeli ✓

### Test 2: Petfendy'den

1. Petfendy'e gir: `http://petfendy.com`
2. Admin paneline gir
3. Oda ekle veya düzenle
4. Resim yükle
5. MinIO Console'da dosyanın geldiğini kontrol et

---

## 🔧 Sorun Giderme

### "Access Denied" hatası alıyorum

**Çözüm:**
1. MinIO Console → Buckets → petfendy → Access
2. Access Rule ekle: Prefix `*`, Access `readonly`

### "Connection Refused" hatası alıyorum

**Çözüm:**
1. MinIO service'inin çalıştığını kontrol et
2. Coolify'da MinIO service'ine git → Logs kontrol et
3. Restart dene

### Resimler yüklenmiyor

**Çözüm:**
1. Environment variables'ı kontrol et
2. `S3_ENDPOINT` doğru mu?
3. `S3_PUBLIC_URL` doğru mu?
4. Application'ı restart et

---

## 📋 Özet

| Ayar | Değer |
|------|-------|
| Service Name | `petfendy-minio` |
| Root User | `petfendy_admin` |
| Root Password | `PetF3ndy2024!MinIO#Secure` |
| Bucket | `petfendy` |
| Region | `us-east-1` |
| Endpoint | `http://46.224.248.228:9000` |
| Public URL | `http://46.224.248.228:9000/petfendy` |

---

## 🎯 Tamamlandı!

MinIO kurulumu tamamlandı! Artık Petfendy uygulamanız dosyaları MinIO'ya yükleyecek.

**Sıradaki adımlar:**
- ✅ Test upload yap
- ✅ Eski dosyaları taşı (varsa)
- ✅ Cloudflare CDN ayarla (opsiyonel)

Herhangi bir sorun olursa bana söyle! 🚀
