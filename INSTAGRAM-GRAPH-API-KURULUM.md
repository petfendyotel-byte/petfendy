# Instagram Graph API Kurulum Rehberi

Instagram Basic Display API 4 Aralık 2024'te sonlandırıldı. Artık **Instagram Graph API** kullanmamız gerekiyor.

## Gereksinimler

1. **Instagram Business veya Creator hesabı** (ücretsiz dönüştürülebilir)
2. **Facebook Page** (Instagram hesabına bağlı)
3. **Meta Developer hesabı**
4. **Facebook App** (Instagram Graph API ile)

## Adım 1: Instagram Hesabını Business/Creator Hesabına Dönüştür

1. Instagram uygulamasını açın
2. **Ayarlar** → **Hesap** → **Profesyonel hesaba geç**
3. **İşletme** veya **İçerik Üreticisi** seçin
4. Kategori seçin (Pet Services)
5. İletişim bilgilerini ekleyin

## Adım 2: Facebook Page Oluştur

1. [facebook.com/pages/create](https://facebook.com/pages/create) adresine gidin
2. **Petfendy** adında sayfa oluşturun
3. Kategori: **Pet Services**
4. Instagram hesabınızı bu sayfaya bağlayın:
   - Sayfa Ayarları → Instagram → Hesap Bağla

## Adım 3: Meta Developer Hesabı

1. [developers.facebook.com](https://developers.facebook.com) adresine gidin
2. Facebook hesabınızla giriş yapın
3. **Developer** olarak kaydolun
4. Telefon numaranızı doğrulayın

## Adım 4: Facebook App Oluştur

1. **Uygulamalarım** → **Uygulama Oluştur**
2. **Diğer** → **İleri**
3. **İşletme** → **İleri**
4. Uygulama adı: **Petfendy Website**
5. İletişim e-postası: **petfendyotel@gmail.com**

## Adım 5: Instagram Graph API Ekle

1. Uygulamanızın kontrol panelinde
2. **Ürün Ekle** → **Instagram Graph API**
3. **Kurulum** butonuna tıklayın

## Adım 6: Access Token Al

### Kısa Süreli Token (1 saat)

1. **Graph API Explorer**: [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Uygulamanızı seçin
3. **User Token Al** → **instagram_graph_user_media** iznini seçin
4. **Access Token Oluştur**

### Uzun Süreli Token (60 gün)

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}"
```

## Adım 7: Instagram Business Account ID Al

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token={LONG_LIVED_TOKEN}"
```

Yanıttan **Instagram Business Account ID**'yi alın.

## Adım 8: Environment Variables

`.env.local` dosyasına ekleyin:

```env
INSTAGRAM_GRAPH_ACCESS_TOKEN=your-long-lived-access-token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your-instagram-business-account-id
```

## Adım 9: Test Et

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/{INSTAGRAM_BUSINESS_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token={ACCESS_TOKEN}"
```

## Token Yenileme (60 günde bir)

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={CURRENT_TOKEN}"
```

## Sorun Giderme

### Hata: "Instagram account is not a business account"
- Instagram hesabınızı Business/Creator hesabına dönüştürün
- Facebook Page'e bağlayın

### Hata: "Insufficient permissions"
- Graph API Explorer'da doğru izinleri seçin
- `instagram_graph_user_media` iznini ekleyin

### Hata: "Token expired"
- Token'ı yenileyin (60 günde bir gerekli)
- Otomatik yenileme sistemi kurun

## Otomatik Token Yenileme

Cron job veya scheduled function ile token'ı otomatik yenileyin:

```javascript
// lib/instagram-token-refresh.ts
export async function refreshInstagramToken() {
  const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${process.env.INSTAGRAM_GRAPH_ACCESS_TOKEN}`)
  
  const data = await response.json()
  
  // Yeni token'ı environment variable'a kaydet
  // Production'da database veya secure storage kullanın
}
```

## Faydalı Linkler

- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken)
- [Instagram Business Account Setup](https://business.instagram.com/getting-started)