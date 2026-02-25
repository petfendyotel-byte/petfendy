# Coolify Database Setup Guide

## Sorun
Veritabanı şeması güncel değil. `users.emailVerifiedAt` kolonu eksik.

## Çözüm

### Adım 1: Coolify Console'a Girin
1. Coolify paneline gidin: http://46.224.248.228:8000
2. Petfendy uygulamasına gidin
3. Sağ üstteki "Terminal" veya "Console" butonuna tıklayın

### Adım 2: Database Push Komutunu Çalıştırın
Console'da şu komutu çalıştırın:

```bash
npx prisma db push --accept-data-loss
```

Bu komut:
- Prisma şemasını okur
- Veritabanındaki eksik kolonları ekler
- Mevcut verileri korur (--accept-data-loss bayrağı ile)

### Adım 3: Uygulamayı Yeniden Başlatın
Console'da:

```bash
npm run start
```

veya Coolify panelinden "Restart" butonuna tıklayın.

## Alternatif: Build Script ile Otomatik

Eğer her deploy'da otomatik olarak veritabanını güncellemek isterseniz:

### package.json'ı güncelleyin:

```json
"scripts": {
  "build": "prisma generate && prisma db push --accept-data-loss && next build",
  ...
}
```

**DİKKAT:** Bu yaklaşım production'da riskli olabilir. Sadece development/staging ortamları için önerilir.

## Doğrulama

Login'i test edin:
- https://petfendy.com/tr
- Email: petfendyotel@gmail.com
- Şifre: ErikUzum52707+.

Eğer hala hata alırsanız, Coolify logs'unda şu mesajı görmemelisiniz:
```
The column `users.emailVerifiedAt` does not exist in the current database.
```

## Fallback Sistemi

Veritabanı bağlantısı başarısız olsa bile, test kullanıcı ile giriş yapabilirsiniz:
- Email: petfendyotel@gmail.com
- Şifre: ErikUzum52707+.

Bu fallback sistemi geçicidir ve sadece acil durumlarda kullanılmalıdır.
