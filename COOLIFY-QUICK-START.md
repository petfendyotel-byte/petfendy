# 🚀 Coolify Quick Start - Petfendy

## 📌 Hazır Bilgiler

### Login
- **URL**: http://46.224.248.228:8000
- **Şifre**: vnLcuuxhCWrAkLLupCNf

### Database Bilgileri (Kullanacağın)
- **Name**: petfendy-db
- **Database**: petfendy
- **Username**: petfendy_user
- **Password**: PetF3ndy2024!Secure#DB

### Secret'lar (Hazır!)
```
JWT_SECRET=E8olK0XnK5F+vhQDGHBPm2LKLf3hR2PfORHVbUDNepL+HNZJT4FShJu94aam5YwXoQoVwfykla6T7TU3q7aiWA==

JWT_REFRESH_SECRET=1+jhAqkT51p2wrpSScc5L9uog7QmvHwiil3UaxA2nYY7s/C7EAZW+cQbbV6tlCFp+16oyBDzd7tYvw+jSNc2NA==

ENCRYPTION_KEY=4GpznE9D7jyNGZD+W+Z2CfP0jzC3eZe5JNR5Lt8o7vc=
```

---

## ⚡ 5 Dakikada Deploy

### 1️⃣ PostgreSQL Oluştur (2 dakika)
```
Resources → + New → PostgreSQL
Name: petfendy-db
Database: petfendy
Username: petfendy_user
Password: PetF3ndy2024!Secure#DB
→ Deploy
→ Connection String'i KOPYALA
```

### 2️⃣ Application Oluştur (1 dakika)
```
Resources → + New → Application
Repository URL: [GIT REPO URL]
Branch: main
Port: 3000
→ Create (henüz deploy etme!)
```

### 3️⃣ Environment Variables Ekle (2 dakika)
Application → Environment Variables → Şunları ekle:

```bash
DATABASE_URL=[ADIM 1'DEN KOPYALADIĞIN CONNECTION STRING]
NODE_ENV=production
JWT_SECRET=E8olK0XnK5F+vhQDGHBPm2LKLf3hR2PfORHVbUDNepL+HNZJT4FShJu94aam5YwXoQoVwfykla6T7TU3q7aiWA==
JWT_REFRESH_SECRET=1+jhAqkT51p2wrpSScc5L9uog7QmvHwiil3UaxA2nYY7s/C7EAZW+cQbbV6tlCFp+16oyBDzd7tYvw+jSNc2NA==
ENCRYPTION_KEY=4GpznE9D7jyNGZD+W+Z2CfP0jzC3eZe5JNR5Lt8o7vc=
NEXT_PUBLIC_TEST_ADMIN_EMAIL=petfendyotel@gmail.com
NEXT_PUBLIC_TEST_ADMIN_PASSWORD_HASH=$2b$12$C8.izTK3qs/MOrucqQzw5.potXQo7b21fHT/Z4EnM6jEmZNZ7EGN2
SMS_PROVIDER=mock
```

### 4️⃣ Deploy (5-10 dakika)
```
→ Deploy butonu
→ Logs'u izle
→ Başarılı olmasını bekle
```

### 5️⃣ Database Migration (30 saniye)
```
Application → Terminal
→ npx prisma db push
```

### ✅ Bitti!
Application URL'ini aç ve test et!

---

## 🆘 Sorun mu var?

### Git Repo URL'i nedir?
Bana söyle, birlikte bulalım veya oluşturalım.

### Build hatası aldım
Hata mesajını bana gönder, çözelim.

### Database bağlanamıyor
Connection string'i kontrol et, bana göster.

---

## 📁 Dosyalar

- `COOLIFY-STEP-BY-STEP.md` - Detaylı adım adım rehber
- `COOLIFY-ENV-VARIABLES.md` - Tüm environment variables
- `generate-secrets.js` - Yeni secret oluşturmak için
- Bu dosya - Hızlı başlangıç

---

## 🎯 Şimdi Ne Yapmalısın?

1. ✅ Coolify'a login ol: http://46.224.248.228:8000
2. ✅ Bu dosyayı yanında tut
3. ✅ Adım 1'den başla
4. ✅ Takıldığın yerde bana sor!

İyi şanslar! 🚀
