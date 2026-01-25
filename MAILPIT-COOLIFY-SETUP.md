# Mailpit + Coolify Kurulum Rehberi

Mailpit'i Coolify'da kurdunuz! Şimdi `info@petfendy.com` mailini Mailpit'e bağlayalım.

## ⚠️ Önemli: DNS Hatası Çözümü

`DNS_PROBE_FINISHED_NXDOMAIN` hatası alıyorsanız, `mailpit.petfendy.com` domain'i henüz yapılandırılmamış demektir.

### Gerçek Mailpit URL'sini Bulma

Coolify'da kurduğunuz Mailpit servisinin gerçek URL'sini bulmak için:

1. **Coolify Dashboard'a gidin**
2. **Applications/Services** bölümünde Mailpit servisinizi bulun
3. **Domains** veya **URLs** bölümünü kontrol edin

### Olası URL Formatları:

```bash
# IP + Port (en yaygın)
http://46.224.248.228:8025

# sslip.io domain
http://mailpit-xyz.46.224.248.228.sslip.io

# Custom domain (eğer ayarladıysanız)
http://your-domain.com:8025
```

### Hızlı URL Bulucu Script

```powershell
.\mailpit-url-finder.ps1
```

Bu script size yardımcı olacak:
- Coolify'dan URL bilgilerini almanızda
- Bağlantıyı test etmede
- Environment variables'ları ayarlamada

## Mailpit Nedir?

Mailpit, geliştirme ve test ortamları için tasarlanmış bir email testing aracıdır:
- **SMTP Server**: Gelen mailleri yakalar (Port 1025)
- **Web UI**: Gelen mailleri görüntüler (Port 8025)
- **API**: Mail verilerine programatik erişim

## Manuel Kurulum Adımları

### 1. Coolify'da Mailpit URL'sini Bulun

```bash
# Örnek URL'ler:
Web UI: http://46.224.248.228:8025
SMTP: 46.224.248.228:1025
```

### 2. Environment Variables Ayarlayın

`.env.local` dosyasına:

```env
# Gerçek IP/domain kullanın
SMTP_HOST=46.224.248.228
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Petfendy <info@petfendy.com>"
```

### 3. Coolify Environment Variables

Coolify'da Petfendy uygulamanızın environment variables bölümüne:

```
SMTP_HOST=46.224.248.228
SMTP_PORT=1025
SMTP_SECURE=false
EMAIL_FROM=Petfendy <info@petfendy.com>
```

## Bağlantı Testi

### 1. Web UI Testi

Tarayıcıda gerçek URL'yi açın:
```
http://46.224.248.228:8025
```

### 2. SMTP Port Testi

PowerShell'de:
```powershell
Test-NetConnection -ComputerName 46.224.248.228 -Port 1025
```

### 3. Email API Testi

Petfendy uygulamanızda:
```
http://localhost:3000/api/test-email
```

## Sorun Giderme

### DNS_PROBE_FINISHED_NXDOMAIN

**Neden:** Domain yapılandırılmamış
**Çözüm:** IP adresi + port kullanın

```bash
# Yanlış
http://mailpit.petfendy.com:8025

# Doğru
http://46.224.248.228:8025
```

### Connection Refused

**Kontrol Listesi:**
1. Mailpit servisi çalışıyor mu?
2. Port 8025 açık mı?
3. Firewall engelliyor mu?

```bash
# Coolify'da servis durumunu kontrol edin
# Logs bölümünden hata mesajlarını inceleyin
```

### SMTP Bağlantı Hatası

**Kontrol Listesi:**
1. Port 1025 açık mı?
2. SMTP_HOST doğru mu?
3. Mailpit SMTP servisi aktif mi?

## Custom Domain Ayarlama (Opsiyonel)

### 1. DNS Kayıtları

```
mailpit.petfendy.com    A    46.224.248.228
smtp.petfendy.com       A    46.224.248.228
```

### 2. Coolify Domain Ayarları

Mailpit servisinizde:
- **Domain**: `mailpit.petfendy.com`
- **Port**: `8025`

### 3. SSL Sertifikası (Opsiyonel)

Coolify otomatik Let's Encrypt sertifikası oluşturabilir.

## Test Senaryoları

### 1. İletişim Formu Testi

1. Petfendy web sitesinde iletişim formunu doldurun
2. Mailpit Web UI'da emaili kontrol edin
3. `info@petfendy.com` adresine gelmiş olmalı

### 2. Rezervasyon Onayı Testi

1. Bir rezervasyon yapın
2. Müşteri emailine onay maili gitmeli
3. Mailpit'te görünmeli

### 3. API Test

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "message": "Bu bir test emailidir"
  }'
```

## Production Geçiş

⚠️ **Önemli**: Mailpit sadece development/test içindir!

Production'da kullanın:
- **SendGrid**: Kolay kurulum, güvenilir
- **Resend**: Modern API, iyi dokümantasyon
- **Gmail SMTP**: Küçük projeler için

```env
# Production örneği
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM="Petfendy <info@petfendy.com>"
```

## Faydalı Komutlar

```bash
# Mailpit logları
docker logs mailpit

# Port kontrolü
netstat -tlnp | grep 8025
netstat -tlnp | grep 1025

# Mailpit yeniden başlatma
docker restart mailpit
```

## Güvenlik Notları

- Mailpit Web UI'sını public erişime kapatın
- Production'da gerçek SMTP kullanın
- Firewall kurallarını kontrol edin
- Sadece gerekli portları açın