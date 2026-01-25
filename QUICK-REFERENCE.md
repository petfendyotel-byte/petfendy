# 📋 HIZLI REFERANS - Petfendy Coolify

## 🔐 Login Bilgileri
```
URL: http://46.224.248.228:8000
Şifre: vnLcuuxhCWrAkLLupCNf
```

## ✅ Tamamlanan
- [x] PostgreSQL Database oluşturuldu
- [x] Connection string alındı
- [x] GitHub Deploy Key eklendi
- [x] Application deploy edildi
- [x] SSL/Cloudflare yapılandırıldı

## 📝 Şimdi Yapılacaklar

### MinIO (S3) Kurulumu 🔥 (ŞİMDİ!)

**Hızlı Kurulum (5 dakika):**
```
1. Coolify → Resources → New → Service → MinIO
2. Service Name: petfendy-minio
3. Root User: petfendy_admin
4. Root Password: PetF3ndy2024!MinIO#Secure
5. Deploy → Bekle (1-2 dakika)
6. MinIO Console'a gir → Bucket oluştur: "petfendy"
7. Bucket'ı public yap (Access: readonly)
8. Environment variables ekle (aşağıda)
9. Application restart et
```

**MinIO Environment Variables (6 adet):**
```bash
AWS_ACCESS_KEY_ID=petfendy_admin
AWS_SECRET_ACCESS_KEY=PetF3ndy2024!MinIO#Secure
AWS_REGION=us-east-1
S3_BUCKET=petfendy
S3_ENDPOINT=http://46.224.248.228:9000
S3_PUBLIC_URL=http://46.224.248.228:9000/petfendy
```

**📚 Detaylı Rehber:** `MINIO-QUICK-SETUP.md`

---

### Database Migration (Henüz Yapılmadı)
```
Terminal → npx prisma db push
```

## 📁 Dosyalar

### MinIO Kurulumu 🔥
- **MINIO-QUICK-SETUP.md** ⭐ - En hızlı kurulum (5 dakika)
- **MINIO-CHECKLIST.md** - Adım adım kontrol listesi
- **MINIO-QUICK-REFERENCE.md** - Hızlı referans kartı
- **COOLIFY-MINIO-SETUP.md** - Detaylı rehber (tüm seçenekler)
- **minio-config-reference.txt** - Tek sayfa referans
- **setup-minio-coolify.ps1** - PowerShell otomasyon scripti

### Deployment
- **DEPLOYMENT-READY.md** - Deployment özeti
- **COOLIFY-STEP-BY-STEP.md** - Adım adım deployment
- **COOLIFY-ENV-READY.txt** - Environment variables
- **COOLIFY-SSL-SETUP.md** - SSL/Cloudflare kurulumu

### Diğer
- **QUICK-REFERENCE.md** - Bu dosya (hızlı bakış)

## 🎯 Özet

1. ✅ PostgreSQL hazır
2. ✅ Application deploy edildi
3. ✅ SSL/Cloudflare yapılandırıldı
4. 🔥 **ŞİMDİ: MinIO kurulumu** (5 dakika)
5. 📝 Database migration yap
6. 🎉 Bitti!

**Kalan süre: ~10 dakika**

---

## 🌐 URL'ler

| Servis | URL |
|--------|-----|
| **Coolify** | http://46.224.248.228:8000 |
| **Petfendy** | http://petfendy.com |
| **MinIO Console** | http://46.224.248.228:9001 (kurulumdan sonra) |
| **MinIO API** | http://46.224.248.228:9000 (kurulumdan sonra) |
