# 🚀 MinIO Kurulumu - BURADAN BAŞLA!

## 📍 Şu Anda Neredesin?

✅ PostgreSQL kuruldu  
✅ Application deploy edildi  
✅ SSL/Cloudflare yapılandırıldı  
🔥 **ŞİMDİ: MinIO (S3) kurulumu yapacağız!**

---

## ⏱️ Süre: 5-10 Dakika

---

## 🎯 Adım 1: MinIO Servisi Oluştur (2 dakika)

### 1.1 Coolify'a Git
```
http://46.224.248.228:8000
```

### 1.2 Yeni Servis Oluştur
1. Sol menüden **"Resources"** tıkla
2. **"+ New"** butonuna tıkla
3. **"Service"** seç
4. Arama kutusuna **"MinIO"** yaz
5. **MinIO** kartına tıkla

### 1.3 Bilgileri Gir
```
Service Name: petfendy-minio
Root User: petfendy_admin
Root Password: PetF3ndy2024!MinIO#Secure
```

### 1.4 Deploy Et
1. **"Deploy"** butonuna tıkla
2. ⏳ 1-2 dakika bekle
3. ✅ "Running" durumunu gör

---

## 🎯 Adım 2: MinIO URL'lerini Al (1 dakika)

### 2.1 MinIO Service Sayfasını Aç
1. Resources → Services → **petfendy-minio** tıkla

### 2.2 URL'leri Not Et
**"Domains"** veya **"URLs"** bölümünde iki URL göreceksin:

```
Console URL: http://minio-console-xxx.46.224.248.228.sslip.io
API URL: http://minio-api-xxx.46.224.248.228.sslip.io
```

veya

```
Console URL: http://46.224.248.228:9001
API URL: http://46.224.248.228:9000
```

**📝 API URL'ini not et! (Sonra lazım olacak)**

---

## 🎯 Adım 3: Bucket Oluştur (2 dakika)

### 3.1 MinIO Console'a Gir
1. **Console URL'ini** tarayıcıda aç
2. Login bilgileri:
   - **Username:** `petfendy_admin`
   - **Password:** `PetF3ndy2024!MinIO#Secure`
3. **"Login"** tıkla

### 3.2 Bucket Oluştur
1. Sol menüden **"Buckets"** tıkla
2. **"Create Bucket"** butonuna tıkla
3. **Bucket Name:** `petfendy` yaz
4. **"Create Bucket"** tıkla
5. ✅ Bucket oluşturuldu!

### 3.3 Bucket'ı Public Yap
1. **"petfendy"** bucket'ına tıkla
2. **"Access"** sekmesine git
3. **"Add Access Rule"** butonuna tıkla
4. Bilgileri gir:
   - **Prefix:** `*` (yıldız işareti)
   - **Access:** **"readonly"** seç
5. **"Save"** tıkla
6. ✅ Bucket artık public!

---

## 🎯 Adım 4: Environment Variables Ekle (2 dakika)

### 4.1 Petfendy Application'a Git
```
http://46.224.248.228:8000/project/rsg4w0ogssskosooko80g4ws/environment/jgoc08cwccgwkw800oogss8g
```

### 4.2 Environment Variables Bölümünü Bul
1. Sayfayı aşağı kaydır
2. **"Environment Variables"** bölümünü bul

### 4.3 Değişkenleri Ekle
Aşağıdaki 6 değişkeni ekle:

```bash
AWS_ACCESS_KEY_ID=petfendy_admin
AWS_SECRET_ACCESS_KEY=PetF3ndy2024!MinIO#Secure
AWS_REGION=us-east-1
S3_BUCKET=petfendy
S3_ENDPOINT=http://46.224.248.228:9000
S3_PUBLIC_URL=http://46.224.248.228:9000/petfendy
```

**⚠️ ÖNEMLİ:** 
- `S3_ENDPOINT` değerini **kendi MinIO API URL'inle** değiştir!
- `S3_PUBLIC_URL` değerini **kendi MinIO API URL'inle** değiştir ve sonuna `/petfendy` ekle!

### 4.4 Kaydet
1. **"Save"** veya **"Update"** butonuna tıkla
2. ✅ Environment variables kaydedildi!

---

## 🎯 Adım 5: Application'ı Restart Et (1 dakika)

### 5.1 Restart Butonu
1. Aynı sayfada **"Restart"** butonunu bul
2. **"Restart"** tıkla
3. ⏳ 30 saniye bekle
4. ✅ Application restart edildi!

---

## 🎯 Adım 6: Test Et! (2 dakika)

### Test 1: MinIO Console'dan
1. MinIO Console'a geri dön
2. **Buckets** → **petfendy** tıkla
3. **"Upload"** butonuna tıkla
4. Bir test resmi seç ve yükle
5. Yüklenen dosyaya tıkla
6. **"Share"** butonuna tıkla
7. URL'i kopyala
8. Yeni sekmede aç
9. ✅ Resim görünüyor mu? **BAŞARILI!**

### Test 2: Petfendy'den (Opsiyonel)
1. http://petfendy.com adresine git
2. Admin paneline giriş yap
3. Oda ekle/düzenle
4. Resim yükle
5. MinIO Console'da dosyanın geldiğini kontrol et
6. ✅ Dosya MinIO'da mı? **BAŞARILI!**

---

## 🎉 Tebrikler!

MinIO kurulumu tamamlandı! 🎊

### ✅ Yapılanlar
- ✅ MinIO servisi oluşturuldu
- ✅ Bucket oluşturuldu ve public yapıldı
- ✅ Environment variables eklendi
- ✅ Application restart edildi
- ✅ Test edildi

### 📝 Sıradaki Adımlar
1. Database migration yap: `npx prisma db push`
2. Production'da test et
3. Eski dosyaları taşı (varsa)

---

## 🔧 Sorun mu Yaşıyorsun?

### "MinIO service deploy olmuyor"
→ Coolify logs'u kontrol et, restart dene

### "Console'a giriş yapamıyorum"
→ Username: `petfendy_admin`, Password: `PetF3ndy2024!MinIO#Secure`

### "Bucket oluşturamıyorum"
→ Root user ile giriş yaptığından emin ol

### "Upload çalışmıyor"
→ Environment variables'ı kontrol et, özellikle `S3_ENDPOINT`

### "Dosyalar görünmüyor"
→ Bucket policy'yi kontrol et (Prefix: `*`, Access: `readonly`)

---

## 📞 Yardım

Hala sorun mu yaşıyorsun? Bana söyle, yardımcı olayım! 🚀

**Kontrol et:**
- [ ] MinIO service çalışıyor mu?
- [ ] Console'a giriş yapabiliyor musun?
- [ ] Bucket oluşturuldu mu?
- [ ] Bucket public mu?
- [ ] Environment variables doğru mu?
- [ ] Application restart edildi mi?

---

## 🎯 Özet

| Adım | Süre | Durum |
|------|------|-------|
| 1. MinIO servisi oluştur | 2 dk | ⬜ |
| 2. URL'leri al | 1 dk | ⬜ |
| 3. Bucket oluştur | 2 dk | ⬜ |
| 4. Environment variables ekle | 2 dk | ⬜ |
| 5. Application restart et | 1 dk | ⬜ |
| 6. Test et | 2 dk | ⬜ |
| **TOPLAM** | **10 dk** | ⬜ |

---

## 🚀 Başla!

Şimdi **Adım 1**'den başla ve her adımı sırayla tamamla!

İyi çalışmalar! 💪
