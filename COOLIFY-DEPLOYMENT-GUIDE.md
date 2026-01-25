# Coolify Deployment Guide - Petfendy

## Yeni Coolify Sunucusuna Deploy Adımları

### 1. PostgreSQL Database Oluştur

1. Coolify Dashboard → Resources → New Resource
2. PostgreSQL seç
3. Ayarlar:
   - Name: `petfendy-db`
   - PostgreSQL Version: 16 (önerilen)
   - Database Name: `petfendy`
   - Username: `petfendy_user`
   - Password: Güçlü bir şifre oluştur
4. Deploy butonuna tıkla
5. Database URL'i kopyala (şu formatta olacak):
   ```
   postgresql://petfendy_user:password@postgres-host:5432/petfendy
   ```

### 2. Next.js Application Oluştur

1. Resources → New Resource → Application
2. Source Type: Git Repository
3. Repository ayarları:
   - Git Provider: GitHub/GitLab
   - Repository URL: `https://github.com/your-username/petfendy.git`
   - Branch: `main`
4. Build Settings:
   - Build Pack: Nixpacks (otomatik)
   - Base Directory: `/petfendy` (eğer monorepo ise)
   - Install Command: `npm install` veya `pnpm install`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Port: `3000`

### 3. Environment Variables Ekle

Application → Environment Variables bölümünde şunları ekle:

```bash
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL=postgresql://petfendy_user:password@postgres-host:5432/petfendy

# ===========================================
# SECURITY - JWT
# ===========================================
JWT_SECRET=<openssl rand -base64 64 ile oluştur>
JWT_REFRESH_SECRET=<openssl rand -base64 64 ile oluştur>

# ===========================================
# ENCRYPTION
# ===========================================
ENCRYPTION_KEY=<openssl rand -base64 32 ile oluştur>

# ===========================================
# TEST ADMIN (Geliştirme için)
# ===========================================
NEXT_PUBLIC_TEST_ADMIN_EMAIL=petfendyotel@gmail.com
NEXT_PUBLIC_TEST_ADMIN_PASSWORD_HASH=$2b$12$C8.izTK3qs/MOrucqQzw5.potXQo7b21fHT/Z4EnM6jEmZNZ7EGN2

# ===========================================
# EMAIL - SendGrid
# ===========================================
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@petfendy.com

# ===========================================
# SMS - NetGSM
# ===========================================
SMS_PROVIDER=netgsm
NETGSM_USERNAME=8xxxxxxxxx
NETGSM_PASSWORD=your-password
NETGSM_SENDER=PETFENDY

# ===========================================
# PAYMENT - PayTR
# ===========================================
PAYTR_MERCHANT_ID=your-merchant-id
PAYTR_MERCHANT_KEY=your-merchant-key
PAYTR_MERCHANT_SALT=your-merchant-salt
PAYTR_SUCCESS_URL=https://petfendy.com/payment/success
PAYTR_FAIL_URL=https://petfendy.com/payment/fail
PAYTR_WEBHOOK_SECRET=your-webhook-secret

# ===========================================
# AWS S3 / Storage
# ===========================================
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-central-1
S3_BUCKET=petfendy
# S3_ENDPOINT=https://your-s3-endpoint.com (S3-compatible için)
# S3_PUBLIC_URL=https://cdn.petfendy.com

# ===========================================
# GOOGLE MAPS
# ===========================================
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# ===========================================
# INSTAGRAM
# ===========================================
INSTAGRAM_ACCESS_TOKEN=your-instagram-token

# ===========================================
# CORS (Production)
# ===========================================
ALLOWED_ORIGINS=https://petfendy.com,https://www.petfendy.com

# ===========================================
# NODE ENV
# ===========================================
NODE_ENV=production
```

### 4. Database Migration Çalıştır

Deploy sonrası database'i hazırla:

**Option 1: Coolify Terminal Kullan**
1. Application → Terminal
2. Şu komutları çalıştır:
```bash
npx prisma generate
npx prisma db push
# veya
npx prisma migrate deploy
```

**Option 2: Build Command'a Ekle**
Build Command'ı şu şekilde güncelle:
```bash
npm run build && npx prisma generate && npx prisma db push
```

### 5. Domain Ayarları

1. Application → Domains
2. Domain ekle:
   - `petfendy.com`
   - `www.petfendy.com`
3. SSL Certificate otomatik oluşturulacak (Let's Encrypt)

### 6. Eski Sunucudan Veri Taşıma (Opsiyonel)

**Database Backup Al:**
```bash
# Eski sunucuda
pg_dump -h old-host -U old-user -d petfendy > petfendy_backup.sql

# Yeni sunucuya yükle
psql -h new-host -U petfendy_user -d petfendy < petfendy_backup.sql
```

**S3 Dosyaları Taşı:**
```bash
# AWS CLI ile
aws s3 sync s3://old-bucket s3://new-bucket --region eu-central-1
```

### 7. Health Check & Monitoring

1. Application → Health Checks
   - Path: `/api/health` (oluşturman gerekebilir)
   - Interval: 30 seconds
   - Timeout: 10 seconds

2. Logs kontrol et:
   - Application → Logs
   - Build logs ve runtime logs'u incele

### 8. Deploy!

1. Application → Deploy
2. "Deploy" butonuna tıkla
3. Build logs'u takip et
4. Deploy tamamlandığında domain'i ziyaret et

## Troubleshooting

### Build Hatası
- `package.json` ve `package-lock.json` güncel mi kontrol et
- Node version uyumlu mu? (package.json'da `engines` belirt)
- Build logs'da hata mesajlarını oku

### Database Bağlantı Hatası
- DATABASE_URL doğru mu?
- PostgreSQL container çalışıyor mu?
- Network ayarları doğru mu? (Coolify internal network)

### Environment Variables Yüklenmedi
- Coolify'da env var'lar kaydedildi mi?
- Restart gerekebilir: Application → Restart

### Port Hatası
- Next.js default port: 3000
- Coolify'da Port ayarını kontrol et

## Güvenlik Kontrol Listesi

- [ ] Tüm secret'lar güçlü ve unique
- [ ] JWT_SECRET ve JWT_REFRESH_SECRET farklı
- [ ] ENCRYPTION_KEY 32 byte (256-bit)
- [ ] Database şifresi güçlü
- [ ] PayTR credentials doğru
- [ ] CORS origins production domain'leri içeriyor
- [ ] SSL certificate aktif
- [ ] Environment variables NEXT_PUBLIC_ prefix'i doğru kullanılmış

## Performans Optimizasyonu

1. **Next.js Optimizasyonları:**
   - `next.config.mjs` içinde `output: 'standalone'` ekle
   - Image optimization ayarları

2. **Database Connection Pooling:**
   - Prisma connection limit ayarla
   - `DATABASE_URL` içine `?connection_limit=10` ekle

3. **Caching:**
   - Redis ekle (opsiyonel)
   - Next.js ISR kullan

## Monitoring & Backup

1. **Automated Backups:**
   - PostgreSQL → Backups → Schedule
   - Daily backup önerilen

2. **Logs:**
   - Application logs düzenli kontrol et
   - Error tracking servisi ekle (Sentry, etc.)

3. **Uptime Monitoring:**
   - External monitoring servisi kullan
   - UptimeRobot, Pingdom, etc.

## Rollback Planı

Bir sorun olursa:
1. Coolify'da önceki deployment'a dön: Application → Deployments → Rollback
2. Veya eski sunucuyu tekrar aktif et
3. DNS'i eski sunucuya yönlendir

## Notlar

- İlk deploy 5-10 dakika sürebilir
- Build cache sonraki deploy'ları hızlandırır
- Production'da `NODE_ENV=production` olmalı
- Database migration'ları dikkatli yap (data loss riski)
