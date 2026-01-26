# Coolify Environment Variables - Petfendy

Coolify'da Application → Environment Variables bölümüne şunları ekle:

## 1. DATABASE (ZORUNLU)
```
DATABASE_URL=postgresql://petfendy_user:ŞIFREN@postgres-xxx:5432/petfendy
```
> ⚠️ ADIM 1'de aldığın PostgreSQL connection string'i buraya yapıştır!

## 2. SECURITY - JWT (ZORUNLU)
```
JWT_SECRET=
JWT_REFRESH_SECRET=
ENCRYPTION_KEY=
```
> 💡 Bu değerleri oluşturmak için:
> - Terminal'de: `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`
> - Veya online: https://generate-secret.vercel.app/64

## 3. NODE ENVIRONMENT (ZORUNLU)
```
NODE_ENV=production
```

## 4. TEST ADMIN (Geliştirme için)
```
NEXT_PUBLIC_TEST_ADMIN_EMAIL=petfendyotel@gmail.com
NEXT_PUBLIC_TEST_ADMIN_PASSWORD_HASH=$2b$12$C8.izTK3qs/MOrucqQzw5.potXQo7b21fHT/Z4EnM6jEmZNZ7EGN2
```

## 5. EMAIL - SendGrid (Opsiyonel - şimdilik)
```
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@petfendy.com
```

## 6. SMS - NetGSM (Opsiyonel - şimdilik)
```
SMS_PROVIDER=mock
NETGSM_USERNAME=
NETGSM_PASSWORD=
NETGSM_SENDER=PETFENDY
```
> 💡 Şimdilik `SMS_PROVIDER=mock` bırak, gerçek SMS göndermez

## 7. PAYMENT - PayTR (Opsiyonel - şimdilik)
```
PAYTR_MERCHANT_ID=
PAYTR_MERCHANT_KEY=
PAYTR_MERCHANT_SALT=
PAYTR_SUCCESS_URL=https://petfendy.com/payment/success
PAYTR_FAIL_URL=https://petfendy.com/payment/fail
PAYTR_WEBHOOK_SECRET=
```

## 8. AWS S3 / Storage (Opsiyonel - şimdilik)
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-central-1
S3_BUCKET=petfendy
```

## 9. GOOGLE MAPS (Opsiyonel - şimdilik)
```
GOOGLE_MAPS_API_KEY=
```

## 10. INSTAGRAM (Opsiyonel - şimdilik)
```
INSTAGRAM_ACCESS_TOKEN=
```

---

## ✅ MINIMUM ÇALIŞMA İÇİN GEREKLI (İlk Deploy)

Sadece bunları ekle, proje çalışır:

1. `DATABASE_URL` - PostgreSQL connection string
2. `JWT_SECRET` - Random 64 byte
3. `JWT_REFRESH_SECRET` - Random 64 byte  
4. `ENCRYPTION_KEY` - Random 32 byte
5. `NODE_ENV=production`
6. `NEXT_PUBLIC_TEST_ADMIN_EMAIL=petfendyotel@gmail.com`
7. `NEXT_PUBLIC_TEST_ADMIN_PASSWORD_HASH=$2b$12$C8.izTK3qs/MOrucqQzw5.potXQo7b21fHT/Z4EnM6jEmZNZ7EGN2`
8. `SMS_PROVIDER=mock`

Diğerlerini sonra ekleyebilirsin!
