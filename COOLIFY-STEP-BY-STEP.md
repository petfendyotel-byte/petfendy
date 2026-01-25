# Coolify Deployment - Adım Adım Rehber

## 🔐 Login Bilgileri
- URL: http://46.224.248.228:8000
- Şifre: vnLcuuxhCWrAkLLupCNf

---

## 📝 ADIM 1: PostgreSQL Database Oluştur

### 1.1 Resources Sayfasına Git
- Sol menüden **"Resources"** tıkla
- Sağ üstten **"+ New"** veya **"Add Resource"** butonuna tıkla

### 1.2 PostgreSQL Seç
- **"Database"** kategorisinden **"PostgreSQL"** seç

### 1.3 Ayarları Gir
Şu bilgileri gir:

**Name (İsim):**
```
petfendy-db
```

**PostgreSQL Version:**
```
16
```

**Database Name:**
```
petfendy
```

**Username:**
```
petfendy_user
```

**Password:**
```
PetF3ndy2024!Secure#DB
```

### 1.4 Deploy Et
- **"Deploy"** veya **"Create"** butonuna tıkla
- ⏳ 1-2 dakika bekle

### 1.5 Connection String Al
- Deploy bittikten sonra database'e tıkla
- **"Connection String"** veya **"Database URL"** bölümünü bul
- Şuna benzer bir string göreceksin:
```
postgresql://petfendy_user:PetF3ndy2024!Secure#DB@postgres-xxx:5432/petfendy
```
- Bu string'i **KOPYALA** ve bir yere kaydet!

---

## 📝 ADIM 2: Next.js Application Oluştur

### 2.1 Yeni Application Ekle
- **"Resources"** → **"+ New"** → **"Application"**

### 2.2 Source Type Seç
- **"Public Repository"** veya **"Git Repository"** seç

### 2.3 Repository Bilgileri
**Git Provider:**
- GitHub, GitLab veya Gitea seç

**Repository URL:**
```
[BURAYA GIT REPO URL'İNİ YAZ]
```
> ⚠️ Repo URL'ini bilmiyorsan, önce bana söyle!

**Branch:**
```
main
```
(veya `master` ise onu yaz)

### 2.4 Build Configuration
**Build Pack:**
```
Nixpacks
```
(Otomatik seçili olmalı)

**Base Directory:**
```
/petfendy
```
(Eğer repo root'unda petfendy klasörü varsa)
(Eğer repo zaten petfendy projesi ise boş bırak)

**Port:**
```
3000
```

**Install Command:**
```
npm install
```

**Build Command:**
```
npm run build
```

**Start Command:**
```
npm start
```

### 2.5 Application Oluştur
- **"Continue"** veya **"Create"** butonuna tıkla
- Henüz deploy etme!

---

## 📝 ADIM 3: Environment Variables Ekle

### 3.1 Environment Variables Sekmesine Git
- Oluşturduğun application'a tıkla
- **"Environment Variables"** veya **"Environment"** sekmesine git

### 3.2 Değişkenleri Ekle
Her bir değişkeni **"+ Add"** veya **"New Variable"** ile ekle:

#### ZORUNLU DEĞIŞKENLER:

**1. DATABASE_URL**
```
postgresql://petfendy_user:PetF3ndy2024!Secure#DB@postgres-xxx:5432/petfendy
```
> ⚠️ ADIM 1.5'te kopyaladığın connection string'i buraya yapıştır!

**2. NODE_ENV**
```
production
```

**3. JWT_SECRET**
```
[AŞAĞIDAKİ KOMUTU ÇALIŞTIR VE ÇIKTIYI BURAYA YAPIŞTIR]
```
Terminalde çalıştır:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**4. JWT_REFRESH_SECRET**
```
[AŞAĞIDAKİ KOMUTU ÇALIŞTIR VE ÇIKTIYI BURAYA YAPIŞTIR]
```
Terminalde çalıştır:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**5. ENCRYPTION_KEY**
```
[AŞAĞIDAKİ KOMUTU ÇALIŞTIR VE ÇIKTIYI BURAYA YAPIŞTIR]
```
Terminalde çalıştır:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**6. NEXT_PUBLIC_TEST_ADMIN_EMAIL**
```
petfendyotel@gmail.com
```

**7. NEXT_PUBLIC_TEST_ADMIN_PASSWORD_HASH**
```
$2b$12$C8.izTK3qs/MOrucqQzw5.potXQo7b21fHT/Z4EnM6jEmZNZ7EGN2
```

**8. SMS_PROVIDER**
```
mock
```

### 3.3 Kaydet
- Tüm değişkenleri ekledikten sonra **"Save"** veya **"Update"** tıkla

---

## 📝 ADIM 4: Deploy Et

### 4.1 Deploy Başlat
- Application sayfasında **"Deploy"** butonuna tıkla

### 4.2 Build Logs İzle
- **"Logs"** veya **"Build Logs"** sekmesine git
- Build sürecini izle
- ⏳ 5-10 dakika sürebilir

### 4.3 Hata Kontrolü
Eğer hata alırsan:
- Hata mesajını kopyala
- Bana gönder
- Birlikte çözelim

---

## 📝 ADIM 5: Database Migration

### 5.1 Terminal Aç
Deploy başarılı olduktan sonra:
- Application → **"Terminal"** veya **"Console"** sekmesine git

### 5.2 Prisma Migration Çalıştır
Terminal'de şu komutu çalıştır:
```bash
npx prisma db push
```

Alternatif:
```bash
npx prisma migrate deploy
```

### 5.3 Başarı Kontrolü
Şu mesajı görmelisin:
```
✔ Database synchronized with Prisma schema
```

---

## 📝 ADIM 6: Domain Ayarla (Opsiyonel)

### 6.1 Domain Ekle
- Application → **"Domains"** sekmesine git
- **"+ Add Domain"** tıkla

### 6.2 Domain Gir
```
petfendy.com
```

### 6.3 SSL Certificate
- **"Generate SSL"** veya **"Enable SSL"** tıkla
- Let's Encrypt otomatik oluşturacak

---

## ✅ BAŞARILI! Kontrol Et

### Test Et
1. Application'ın URL'ini aç (Coolify'da gösterilecek)
2. Ana sayfa yüklenmeli
3. `/tr` veya `/en` sayfalarını dene
4. Admin login dene: petfendyotel@gmail.com

---

## 🆘 Sorun Giderme

### Build Hatası
- Logs'u kontrol et
- Hata mesajını bana gönder

### Database Bağlantı Hatası
- DATABASE_URL doğru mu kontrol et
- PostgreSQL container çalışıyor mu kontrol et

### Port Hatası
- Port 3000 olarak ayarlı mı kontrol et

### Environment Variables Yüklenmedi
- Application'ı restart et
- Değişkenleri tekrar kontrol et

---

## 📞 Yardım

Herhangi bir adımda takılırsan:
1. Ekran görüntüsü al
2. Hata mesajını kopyala
3. Bana gönder
4. Birlikte çözelim!
