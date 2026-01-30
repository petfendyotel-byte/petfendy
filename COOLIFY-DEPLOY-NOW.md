# 🚀 Coolify Deploy - Hemen Başla!

## 1. Coolify'a Giriş Yap
- URL: http://46.224.248.228:8000
- Kullanıcı bilgilerin ile giriş yap

## 2. PostgreSQL Database Oluştur

### Database Ayarları:
```
Name: petfendy-db
Database Name: petfendy
Username: petfendy_user
Password: PetF3ndy2024!Secure#DB
```

## 3. Application Oluştur

### Repository Bilgileri:
```
Repository URL: https://github.com/petfendyotel-byte/petfendy
Branch: main
Build Command: npm run build
Start Command: npm start
Port: 3000
```

## 4. Environment Variables (Kopyala-Yapıştır)

```bash
# Temel
NODE_ENV=production
NEXTAUTH_URL=https://petfendy.com
NEXTAUTH_SECRET=PetF3ndy2024!NextAuth#Secret

# Database (Coolify otomatik verecek)
DATABASE_URL=postgresql://petfendy_user:PetF3ndy2024!Secure#DB@petfendy-db:5432/petfendy

# İyzico (Test - sonra production ile değiştir)
IYZICO_API_KEY=sandbox-test-api-key
IYZICO_SECRET_KEY=sandbox-test-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
IYZICO_SUCCESS_URL=https://petfendy.com/payment/success
IYZICO_FAIL_URL=https://petfendy.com/payment/fail

# Email
RESEND_API_KEY=re_test_key_placeholder
FROM_EMAIL=noreply@petfendy.com

# SMS (Test modu)
NETGSM_USERNAME=test_user
NETGSM_PASSWORD=test_pass
SMS_FORCE_MOCK=true

# reCAPTCHA (Test keys)
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# MinIO (Coolify'da ayrı oluşturacaksın)
MINIO_ENDPOINT=minio.petfendy.com
MINIO_ACCESS_KEY=petfendy_minio
MINIO_SECRET_KEY=PetF3ndy2024!MinIO#Secret
MINIO_BUCKET_NAME=petfendy-uploads

# Güvenlik
JWT_SECRET=PetF3ndy2024!JWT#Secret#Key
ENCRYPTION_KEY=PetF3ndy2024!Encryption#Key#32Chars
IYZICO_WEBHOOK_SECRET=PetF3ndy2024!Webhook#Secret

# Instagram (Opsiyonel)
INSTAGRAM_ACCESS_TOKEN=test_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=test_account

# Google Maps (Opsiyonel)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 5. Domain Ayarları
- Domain: petfendy.com
- SSL: Let's Encrypt (otomatik)

## 6. Deploy!
"Deploy" butonuna tıkla ve bekle.

## 7. İlk Test
Deploy tamamlandıktan sonra:
1. https://petfendy.com adresine git
2. Ana sayfa yüklendiğini kontrol et
3. Kayıt ol / Giriş yap test et

## Sorun Çıkarsa
1. Coolify logs'ları kontrol et
2. Environment variables'ları tekrar kontrol et
3. Database bağlantısını kontrol et

## Production Hazırlığı
Deploy başarılı olduktan sonra:
1. İyzico production keys al
2. Resend API key al
3. NetGSM credentials al
4. Google Maps API key al
5. Environment variables'ları güncelle

## 🎉 Başarılı Deploy Sonrası
- İyzico merchant başvurusu yap
- SSL sertifikası kontrol et
- Tüm sayfaları test et
- Admin paneline giriş yap

**Repository:** https://github.com/petfendyotel-byte/petfendy
**Branch:** main
**Status:** ✅ READY TO DEPLOY