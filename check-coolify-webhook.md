# 🔗 Coolify Webhook URL Alma

## Adımlar:

1. **Coolify'a git**: http://46.224.248.228:8000
2. **Application sayfasına git** (Petfendy)
3. **"Webhooks" sekmesine tıkla**
4. **"Deploy Webhook" URL'ini kopyala**

## Webhook URL Formatı:
```
http://46.224.248.228:8000/api/v1/deploy/webhook/[UNIQUE_ID]
```

## GitHub Webhook Ayarları:

1. **GitHub'a git**: https://github.com/petfendyotel-byte/petfendy/settings/hooks
2. **"Add webhook" tıkla**
3. **Payload URL**: Coolify webhook URL'ini yapıştır
4. **Content type**: `application/json`
5. **Which events**: `Just the push event`
6. **Active**: ✅ İşaretle
7. **"Add webhook" tıkla**

## Test:

Webhook eklendikten sonra, her GitHub'a push yaptığında Coolify otomatik deploy başlatacak!

## Manuel Deploy:

Webhook URL'ini aldıktan sonra:
```powershell
.\trigger-coolify-deploy.ps1 -WebhookUrl "WEBHOOK_URL_BURAYA"
```