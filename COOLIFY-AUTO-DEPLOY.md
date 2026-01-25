# 🚀 Coolify Otomatik Deployment

## İki Yöntem Var:

### Yöntem 1: Webhook ile Deploy (Daha Kolay) ⭐

#### Adım 1: Webhook URL Al
1. Coolify'a git: http://46.224.248.228:8000
2. Application sayfasına git
3. **"Webhooks"** sekmesine tıkla
4. **"Deploy Webhook"** URL'ini kopyala

#### Adım 2: Script'i Çalıştır
```powershell
.\trigger-coolify-deploy.ps1 -WebhookUrl "WEBHOOK_URL_BURAYA"
```

**Örnek:**
```powershell
.\trigger-coolify-deploy.ps1 -WebhookUrl "http://46.224.248.228:8000/api/v1/deploy/webhook/abc123"
```

---

### Yöntem 2: API Token ile Deploy (Daha Gelişmiş)

#### Adım 1: API Token Al
1. Coolify'a git: http://46.224.248.228:8000
2. Sağ üst → **Profile** veya **Settings**
3. **"API Tokens"** sekmesine git
4. **"Create Token"** tıkla
5. Token'ı kopyala

#### Adım 2: Script'i Çalıştır
```powershell
.\coolify-api-deploy.ps1 -ApiToken "YOUR_API_TOKEN"
```

**Örnek:**
```powershell
.\coolify-api-deploy.ps1 -ApiToken "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🎯 Hangi Yöntemi Seçmeliyim?

### Webhook (Yöntem 1) - Önerilen
- ✅ Daha basit
- ✅ Token yönetimi yok
- ✅ Tek satır komut
- ❌ Deployment durumunu takip edemez

### API Token (Yöntem 2) - Gelişmiş
- ✅ Deployment durumunu takip eder
- ✅ Otomatik success/fail kontrolü
- ✅ Daha fazla kontrol
- ❌ Token yönetimi gerekli

---

## 📝 Kullanım Örnekleri

### Hızlı Deploy
```powershell
# Webhook ile (en hızlı)
.\trigger-coolify-deploy.ps1 -WebhookUrl "YOUR_WEBHOOK_URL"
```

### Deployment Takipli Deploy
```powershell
# API Token ile (durumu takip eder)
.\coolify-api-deploy.ps1 -ApiToken "YOUR_API_TOKEN"
```

---

## 🔄 Otomatik Deploy Workflow

### Git Push Sonrası Otomatik Deploy

**Option 1: Git Hook ile**
`.git/hooks/post-commit` dosyası oluştur:
```bash
#!/bin/bash
# Her commit sonrası otomatik deploy
powershell.exe -File trigger-coolify-deploy.ps1 -WebhookUrl "YOUR_WEBHOOK_URL"
```

**Option 2: GitHub Actions ile**
`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Coolify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify Deploy
        run: |
          curl -X POST ${{ secrets.COOLIFY_WEBHOOK_URL }}
```

---

## 🆘 Sorun Giderme

### "API Token geçersiz" Hatası
- Token'ı yeniden oluştur
- Token'ı doğru kopyaladığından emin ol

### "Webhook URL bulunamadı" Hatası
- Coolify'da Webhooks sekmesini kontrol et
- URL'i tam kopyaladığından emin ol

### "Deployment başarısız" Hatası
- Coolify'da logs'u kontrol et
- Build hatalarını incele

---

## 📚 Daha Fazla Bilgi

### Coolify API Dokümantasyonu
```
http://46.224.248.228:8000/api/documentation
```

### Script Parametreleri

**trigger-coolify-deploy.ps1:**
- `-WebhookUrl`: Coolify webhook URL'i (zorunlu)

**coolify-api-deploy.ps1:**
- `-ApiToken`: Coolify API token (zorunlu)
- `-CoolifyUrl`: Coolify sunucu URL'i (opsiyonel, default: http://46.224.248.228:8000)
- `-ApplicationUuid`: Application UUID (opsiyonel, default: vckgcw40o0wkcsswsc4okgkc)

---

## ✅ Başarılı Deployment Sonrası

1. ✅ Application URL'ini ziyaret et
2. ✅ Ana sayfa yükleniyor mu kontrol et
3. ✅ `/tr` ve `/en` sayfalarını test et
4. ✅ Database migration yap: `npx prisma db push`

---

## 🎉 Tebrikler!

Artık tek komutla Coolify'a deploy edebilirsin! 🚀
