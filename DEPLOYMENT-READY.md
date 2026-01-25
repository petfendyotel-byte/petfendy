# ✅ DEPLOYMENT READY - Petfendy

## 🎉 Hazırlık Tamamlandı!

Kod GitHub'a push edildi ve Coolify deployment için hazır!

---

## 📋 ŞİMDİ YAPMAN GEREKENLER

### 1️⃣ Coolify'a Login Ol
```
URL: http://46.224.248.228:8000
Şifre: vnLcuuxhCWrAkLLupCNf
```

### 2️⃣ PostgreSQL Oluştur (2 dakika)

**Resources → + New → PostgreSQL**

Kopyala-yapıştır:
```
Name: petfendy-db
PostgreSQL Version: 16
Database Name: petfendy
Username: petfendy_user
Password: PetF3ndy2024!Secure#DB
```

**→ Deploy butonuna tıkla**

**→ Connection String'i KOPYALA** (şuna benzer):
```
postgresql://petfendy_user:PetF3ndy2024!Secure#DB@postgres-xxx:5432/petfendy
```

---

### 3️⃣ Application Oluştur (1 dakika)

**Resources → + New → Application**

Kopyala-yapıştır:
```
Source: Public Repository
Repository URL: https://github.com/petfendyotel-byte/petfendy.git
Branch: main
Build Pack: Nixpacks (otomatik)
Port: 3000
```

**→ Create (henüz deploy etme!)**

---

### 4️⃣ Environment Variables Ekle (2 dakika)

**Application → Environment Variables**

Her birini **+ Add Variable** ile ekle:

#### ZORUNLU (Kopyala-yapıştır):

**DATABASE_URL**
```
[ADIM 2'DEN KOPYALADIĞIN CONNECTION STRING]
```

**NODE_ENV**
```
production
```

**JWT_SECRET**
```
E8olK0XnK5F+vhQDGHBPm2LKLf3hR2PfORHVbUDNepL+HNZJT4FShJu94aam5YwXoQoVwfykla6T7TU3q7aiWA==
```

**JWT_REFRESH_SECRET**
```
1+jhAqkT51p2wrpSScc5L9uog7QmvHwiil3UaxA2nYY7s/C7EAZW+cQbbV6tlCFp+16oyBDzd7tYvw+jSNc2NA==
```

**ENCRYPTION_KEY**
```
4GpznE9D7jyNGZD+W+Z2CfP0jzC3eZe5JNR5Lt8o7vc=
```

**NEXT_PUBLIC_TEST_ADMIN_EMAIL**
```
petfendyotel@gmail.com
```

**NEXT_PUBLIC_TEST_ADMIN_PASSWORD_HASH**
```
$2b$12$C8.izTK3qs/MOrucqQzw5.potXQo7b21fHT/Z4EnM6jEmZNZ7EGN2
```

**SMS_PROVIDER**
```
mock
```

**→ Save / Update**

---

### 5️⃣ Deploy Et! (5-10 dakika)

**→ Deploy butonuna tıkla**

**→ Logs sekmesine git ve izle**

Build süreci:
- ✅ Dependencies installing...
- ✅ Prisma generating...
- ✅ Next.js building...
- ✅ Docker image creating...
- ✅ Container starting...
- ✅ **Deployment successful!**

---

### 6️⃣ Database Migration (30 saniye)

Deploy başarılı olduktan sonra:

**Application → Terminal / Console**

Şu komutu çalıştır:
```bash
npx prisma db push
```

Başarı mesajı:
```
✔ Database synchronized with Prisma schema
```

---

## 🎯 BAŞARILI! Test Et

1. Coolify'da application URL'ini bul
2. Tarayıcıda aç
3. Ana sayfa yüklenmeli
4. `/tr` ve `/en` sayfalarını dene
5. Admin login test et

---

## 📊 Yapılanlar

✅ Dockerfile oluşturuldu
✅ next.config.mjs güncellendi (standalone output)
✅ Environment variables hazırlandı
✅ Secret'lar oluşturuldu
✅ Kod GitHub'a push edildi
✅ Deployment rehberleri hazırlandı

---

## 🆘 Sorun mu var?

### Build Hatası
- Logs'u kontrol et
- Hata mesajını bana gönder

### Database Bağlanamıyor
- DATABASE_URL'i kontrol et
- PostgreSQL container çalışıyor mu?

### Port Hatası
- Port 3000 olarak ayarlı mı?

### Environment Variables Yüklenmiyor
- Application'ı restart et
- Değişkenleri tekrar kontrol et

---

## 📁 Yardımcı Dosyalar

- **COOLIFY-QUICK-START.md** - Hızlı başlangıç (5 dakika)
- **COOLIFY-STEP-BY-STEP.md** - Detaylı adım adım
- **COOLIFY-ENV-VARIABLES.md** - Tüm environment variables
- **generate-secrets.js** - Yeni secret oluştur
- **docker-compose.yml** - Alternatif: Docker Compose ile deploy

---

## 🚀 Şimdi Ne Yapmalısın?

1. ✅ Coolify'a git: http://46.224.248.228:8000
2. ✅ Bu dosyayı yanında tut
3. ✅ Adım 1'den başla
4. ✅ Her adımı kopyala-yapıştır yap
5. ✅ 10 dakikada bitir!

**Başarılar! 🎉**
