# ✅ MinIO Kurulum Kontrol Listesi

## 📋 Adım Adım Kontrol Listesi

### 1. MinIO Servisi Oluşturma
- [ ] Coolify'a giriş yaptım: http://46.224.248.228:8000
- [ ] Resources → New → Service → MinIO seçtim
- [ ] Service Name: `petfendy-minio` girdim
- [ ] Root User: `petfendy_admin` girdim
- [ ] Root Password: `PetF3ndy2024!MinIO#Secure` girdim
- [ ] Deploy butonuna tıkladım
- [ ] 1-2 dakika bekledim
- [ ] Service başarıyla deploy oldu ✓

### 2. MinIO URL'lerini Alma
- [ ] MinIO service sayfasını açtım
- [ ] Console URL'ini not aldım: `_______________________`
- [ ] API URL'ini not aldım: `_______________________`

**Örnek URL'ler:**
```
Console: http://minio-console-xxx.46.224.248.228.sslip.io
API: http://minio-api-xxx.46.224.248.228.sslip.io
```

### 3. MinIO Console'a Giriş
- [ ] Console URL'ini tarayıcıda açtım
- [ ] Username: `petfendy_admin` ile giriş yaptım
- [ ] Password: `PetF3ndy2024!MinIO#Secure` ile giriş yaptım
- [ ] MinIO dashboard'u görüyorum ✓

### 4. Bucket Oluşturma
- [ ] Sol menüden "Buckets" sekmesine tıkladım
- [ ] "Create Bucket" butonuna tıkladım
- [ ] Bucket Name: `petfendy` girdim
- [ ] "Create Bucket" butonuna tıkladım
- [ ] Bucket başarıyla oluşturuldu ✓

### 5. Bucket'ı Public Yapma
- [ ] `petfendy` bucket'ına tıkladım
- [ ] "Access" veya "Policies" sekmesine gittim
- [ ] "Add Access Rule" butonuna tıkladım
- [ ] Prefix: `*` girdim
- [ ] Access: `readonly` seçtim
- [ ] "Save" butonuna tıkladım
- [ ] Public access ayarlandı ✓

### 6. Environment Variables Ekleme
- [ ] Coolify'da Petfendy application sayfasını açtım
- [ ] "Environment Variables" bölümüne gittim
- [ ] Aşağıdaki değişkenleri ekledim:

```bash
AWS_ACCESS_KEY_ID=petfendy_admin
AWS_SECRET_ACCESS_KEY=PetF3ndy2024!MinIO#Secure
AWS_REGION=us-east-1
S3_BUCKET=petfendy
S3_ENDPOINT=http://46.224.248.228:9000
S3_PUBLIC_URL=http://46.224.248.228:9000/petfendy
```

**NOT:** `S3_ENDPOINT` ve `S3_PUBLIC_URL` değerlerini kendi MinIO API URL'imle değiştirdim!

- [ ] "Save" butonuna tıkladım
- [ ] Environment variables kaydedildi ✓

### 7. Application Restart
- [ ] Coolify'da Petfendy application sayfasını açtım
- [ ] "Restart" butonuna tıkladım
- [ ] 30 saniye bekledim
- [ ] Application başarıyla restart oldu ✓

### 8. Test - MinIO Console'dan
- [ ] MinIO Console'a girdim
- [ ] Buckets → petfendy'e tıkladım
- [ ] "Upload" butonuna tıkladım
- [ ] Bir test resmi yükledim
- [ ] Dosyaya tıkladım
- [ ] "Share" → URL'i kopyaladım
- [ ] URL'i tarayıcıda açtım
- [ ] Resim görünüyor ✓

### 9. Test - Petfendy Application'dan
- [ ] Petfendy'e girdim: http://petfendy.com
- [ ] Admin paneline giriş yaptım
- [ ] Oda ekleme/düzenleme sayfasını açtım
- [ ] Bir resim yükledim
- [ ] Resim başarıyla yüklendi ✓
- [ ] MinIO Console'da dosyanın geldiğini kontrol ettim ✓

### 10. Opsiyonel - Eski Dosyaları Taşıma
- [ ] Eski sunucuda MinIO var mı? (Evet/Hayır)
- [ ] Eski dosyaları yeni MinIO'ya taşıdım
- [ ] Dosyalar başarıyla taşındı ✓

---

## 🎯 Kurulum Durumu

**Toplam Adım:** 10
**Tamamlanan:** _____ / 10

---

## 📊 Yapılandırma Özeti

| Ayar | Değer | Durum |
|------|-------|-------|
| Service Name | `petfendy-minio` | ⬜ |
| Root User | `petfendy_admin` | ⬜ |
| Root Password | `PetF3ndy2024!MinIO#Secure` | ⬜ |
| Bucket Name | `petfendy` | ⬜ |
| Bucket Access | Public (readonly) | ⬜ |
| Console URL | _________________ | ⬜ |
| API URL | _________________ | ⬜ |
| Environment Variables | Eklendi | ⬜ |
| Application Restart | Yapıldı | ⬜ |
| Test Upload | Başarılı | ⬜ |

---

## 🔧 Sorun Giderme

### Sorun: MinIO service deploy olmuyor
**Çözüm:**
1. Coolify logs'u kontrol et
2. Port çakışması var mı kontrol et
3. Service'i sil ve tekrar oluştur

### Sorun: Console'a giriş yapamıyorum
**Çözüm:**
1. Username/password'u kontrol et
2. Console URL'ini kontrol et
3. MinIO service'inin çalıştığını kontrol et

### Sorun: Bucket oluşturamıyorum
**Çözüm:**
1. Console'a giriş yaptığından emin ol
2. Root user ile giriş yaptığından emin ol
3. Tarayıcı console'unda hata var mı kontrol et

### Sorun: Dosyalar public değil
**Çözüm:**
1. Bucket access policy'yi kontrol et
2. Prefix `*` ve Access `readonly` olmalı
3. Policy'yi sil ve tekrar ekle

### Sorun: Application'dan upload çalışmıyor
**Çözüm:**
1. Environment variables'ı kontrol et
2. `S3_ENDPOINT` doğru mu?
3. `S3_PUBLIC_URL` doğru mu?
4. Application'ı restart et
5. Application logs'u kontrol et

### Sorun: Yüklenen dosyalar görünmüyor
**Çözüm:**
1. MinIO Console'da dosya var mı kontrol et
2. Public URL doğru mu kontrol et
3. Bucket policy doğru mu kontrol et
4. Tarayıcı console'unda network hatası var mı kontrol et

---

## 📞 Yardım

Hangi adımda takıldın? Bana söyle, yardımcı olayım! 🚀

**Kontrol etmen gerekenler:**
1. MinIO service çalışıyor mu?
2. Console'a giriş yapabiliyor musun?
3. Bucket oluşturuldu mu?
4. Bucket public mu?
5. Environment variables eklendi mi?
6. Application restart edildi mi?

---

## 🎉 Tamamlandı!

Tüm adımları tamamladıysan, MinIO kurulumu başarılı! 🎊

**Sıradaki adımlar:**
- ✅ Production'da test et
- ✅ Backup stratejisi belirle
- ✅ CDN ayarla (Cloudflare - opsiyonel)
- ✅ Monitoring ekle (opsiyonel)

Başarılar! 🚀
