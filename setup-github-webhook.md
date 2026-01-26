# 🔗 GitHub Webhook Kurulumu

## 🎯 Otomatik Deploy için GitHub Webhook

### 1️⃣ Coolify'dan Webhook URL Al

**Coolify'a git**: http://46.224.248.228:8000
1. Petfendy application'ına git
2. **"Webhooks"** sekmesine tıkla
3. **"Deploy Webhook"** URL'ini kopyala

### 2️⃣ GitHub'da Webhook Ekle

**GitHub Webhook Sayfası**: https://github.com/petfendyotel-byte/petfendy/settings/hooks

**"Add webhook" butonuna tıkla ve şu ayarları yap:**

| Ayar | Değer |
|------|-------|
| **Payload URL** | Coolify'dan aldığın webhook URL |
| **Content type** | `application/json` |
| **Secret** | Boş bırak |
| **Which events would you like to trigger this webhook?** | `Just the push event` |
| **Active** | ✅ İşaretle |

### 3️⃣ Webhook'u Test Et

1. **"Add webhook"** tıkla
2. Webhook eklendikten sonra **"Recent Deliveries"** kontrol et
3. Test için küçük bir değişiklik yap ve push et

---

## 🚀 Sonuç

Webhook kurulduktan sonra:
- ✅ Her `git push origin main` komutu otomatik deploy tetikler
- ✅ GitHub'da commit yaptığında Coolify otomatik build başlatır
- ✅ 5-10 dakika sonra değişiklikler canlıda görünür

---

## 📱 Manuel Deploy

Webhook kurmak istemiyorsan, manuel deploy için:

```powershell
# Webhook URL'ini al ve çalıştır:
.\trigger-coolify-deploy.ps1 -WebhookUrl "WEBHOOK_URL_BURAYA"
```

---

## 🎉 Başarılı!

Artık GitHub'a her push yaptığında otomatik deploy olacak! 🚀

**Test için:**
1. Küçük bir değişiklik yap
2. `git push origin main`
3. Coolify'da deployment'ı izle
4. 5-10 dakika sonra canlı siteyi kontrol et