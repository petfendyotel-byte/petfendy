# 🎯 SONRAKİ ADIMLAR - Petfendy Coolify Deployment

## ✅ Tamamlanan: PostgreSQL Database

```
✓ Database oluşturuldu
✓ Connection string alındı
```

---

## 📝 ŞİMDİ YAP: Application Oluştur

### ADIM 1: Yeni Application Ekle

Coolify'da:
1. Sol menüden **"Resources"** tıkla
2. Sağ üstten **"+ New"** tıkla
3. **"Application"** seç

---

### ADIM 2: Source Ayarları

**Source Type:**
- **"Public Repository"** seç

**Git Provider:**
- **GitHub** seç

**Repository URL:** (Kopyala-yapıştır)
```
https://github.com/petfendyotel-byte/petfendy.git
```

**Branch:** (Kopyala-yapıştır)
```
main
```

**→ Continue / Next**

---

### ADIM 3: Build Configuration

**Build Pack:**
```
Nixpacks
```
(Otomatik seçili olmalı, değiştirme)

**Port:** (Kopyala-yapıştır)
```
3000
```

**Base Directory:** (Boş bırak veya kopyala-yapıştır)
```
/petfendy
```

**Install Command:** (Opsiyonel - boş bırakabilirsin)
```
npm install
```

**Build Command:** (Opsiyonel - boş bırakabilirsin)
```
npm run build
```

**Start Command:** (Opsiyonel - boş bırakabilirsin)
```
npm start
```

**→ Create / Continue**

⚠️ **HENÜZ DEPLOY ETME!** Önce environment variables ekleyeceğiz.

---

### ADIM 4: Environment Variables Ekle

Application oluştuktan sonra:

1. Oluşturduğun application'a tıkla
2. **"Environment Variables"** veya **"Environment"** sekmesine git
3. **"+ Add"** veya **"New Variable"** butonuna tıkla

Her bir değişkeni tek tek ekle:

#### 1. DATABASE_URL
**Key:**
```
DATABASE_URL
```
**Value:**
```
postgres://postgres:QTLv9rzUDyYQ5GFQIsUGc7rA2fm843iL91bvALTdI2qUUjmDDeFgPUvVm9xNoBnI@pw0cos400cwk84o4kwc0k0gc:5432/postgres
```

#### 2. NODE_ENV
**Key:**
```
NODE_ENV
```
**Value:**
```
production
```

#### 3. JWT_SECRET
**Key:**
```
JWT_SECRET
```
**Value:**
```
E8olK0XnK5F+vhQDGHBPm2LKLf3hR2PfORHVbUDNepL+HNZJT4FShJu94aam5YwXoQoVwfykla6T7TU3q7aiWA==
```

#### 4. JWT_REFRESH_SECRET
**Key:**
```
JWT_REFRESH_SECRET
```
**Value:**
```
1+jhAqkT51p2wrpSScc5L9uog7QmvHwiil3UaxA2nYY7s/C7EAZW+cQbbV6tlCFp+16oyBDzd7tYvw+jSNc2NA==
```

#### 5. ENCRYPTION_KEY
**Key:**
```
ENCRYPTION_KEY
```
**Value:**
```
4GpznE9D7jyNGZD+W+Z2CfP0jzC3eZe5JNR5Lt8o7vc=
```

#### 6. NEXT_PUBLIC_TEST_ADMIN_EMAIL
**Key:**
```
NEXT_PUBLIC_TEST_ADMIN_EMAIL
```
**Value:**
```
petfendyotel@gmail.com
```

#### 7. NEXT_PUBLIC_TEST_ADMIN_PASSWORD_HASH
**Key:**
```
NEXT_PUBLIC_TEST_ADMIN_PASSWORD_HASH
```
**Value:**
```
$2b$12$C8.izTK3qs/MOrucqQzw5.potXQo7b21fHT/Z4EnM6jEmZNZ7EGN2
```

#### 8. SMS_PROVIDER
**Key:**
```
SMS_PROVIDER
```
**Value:**
```
mock
```

**→ Save / Update**

---

### ADIM 5: Deploy Et!

1. **"Deploy"** butonuna tıkla
2. **"Logs"** sekmesine git
3. Build sürecini izle

**Beklenen süreç:**
```
⏳ Cloning repository...
⏳ Installing dependencies...
⏳ Generating Prisma client...
⏳ Building Next.js...
⏳ Creating Docker image...
⏳ Starting container...
✅ Deployment successful!
```

**Süre:** 5-10 dakika

---

### ADIM 6: Database Migration

Deploy başarılı olduktan sonra:

1. Application sayfasında **"Terminal"** veya **"Console"** sekmesine git
2. Şu komutu çalıştır:

```bash
npx prisma db push
```

**Beklenen çıktı:**
```
✔ Database synchronized with Prisma schema
```

---

## 🎉 BAŞARILI!

### Test Et:

1. Coolify'da application URL'ini bul (örn: `https://petfendy-xxx.coolify.io`)
2. Tarayıcıda aç
3. Ana sayfa yüklenmeli
4. `/tr` sayfasını dene
5. `/en` sayfasını dene

### Admin Login Test:
```
Email: petfendyotel@gmail.com
Şifre: (test şifresi - hash'lenmiş)
```

---

## 🆘 Sorun Giderme

### Build Hatası Aldım
1. Logs'u kontrol et
2. Hata mesajını kopyala
3. Bana gönder

### "Module not found" Hatası
- `npm install`제대로 çalıştı mı kontrol et
- Dependencies eksik olabilir

### Database Bağlanamıyor
- DATABASE_URL doğru mu kontrol et
- PostgreSQL container çalışıyor mu kontrol et

### Port Hatası
- Port 3000 olarak ayarlı mı kontrol et

### Prisma Hatası
- `npx prisma generate` çalıştır
- Sonra `npx prisma db push` tekrar dene

---

## 📞 Yardım

Herhangi bir adımda takılırsan:
1. Ekran görüntüsü al
2. Hata mesajını kopyala
3. Bana gönder
4. Birlikte çözelim!

---

## 📁 Yardımcı Dosyalar

- **COOLIFY-ENV-READY.txt** - Tüm env variables (kopyala-yapıştır)
- **DEPLOYMENT-READY.md** - Genel bakış
- **COOLIFY-STEP-BY-STEP.md** - Detaylı rehber

---

## ✅ Checklist

- [ ] Application oluşturuldu
- [ ] Repository URL girildi
- [ ] Branch: main seçildi
- [ ] Port: 3000 ayarlandı
- [ ] 8 environment variable eklendi
- [ ] Deploy edildi
- [ ] Logs kontrol edildi
- [ ] Database migration yapıldı
- [ ] Site test edildi

**Başarılar! 🚀**
