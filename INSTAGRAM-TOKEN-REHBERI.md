# Instagram Access Token Alma Rehberi

## Ön Gereksinimler
- Petfendy Instagram hesabının Business veya Creator hesabı olması gerekiyor
- Meta Developer hesabı (Facebook hesabı ile giriş yapabilirsiniz)

## Adım 1: Meta Developer Console'a Giriş
1. https://developers.facebook.com adresine gidin
2. Facebook hesabınızla giriş yapın
3. Sağ üst köşeden "My Apps" → "Create App" tıklayın

## Adım 2: Uygulama Oluşturma
1. "Consumer" seçeneğini seçin
2. "Next" butonuna tıklayın
3. Uygulama bilgilerini doldurun:
   - **App name**: `Petfendy Website`
   - **App contact email**: `petfendyotel@gmail.com`
   - **Business account**: Varsa seçin, yoksa boş bırakın
4. "Create app" butonuna tıklayın

## Adım 3: Instagram Basic Display API Ekleme
1. Oluşturulan uygulamanın dashboard'ında "Add Product" bölümünü bulun
2. "Instagram Basic Display" kartını bulun ve "Set up" butonuna tıklayın
3. Sol menüden "Instagram Basic Display" → "Basic Display" seçin

## Adım 4: Instagram App Ayarları
1. "Create New App" butonuna tıklayın
2. Gerekli alanları doldurun:
   - **Display Name**: `Petfendy Website`
   - **Valid OAuth Redirect URIs**: `https://petfendy.com/auth/instagram/callback`
   - **Deauthorize Callback URL**: `https://petfendy.com/auth/instagram/deauth`
   - **Data Deletion Request URL**: `https://petfendy.com/auth/instagram/delete`
3. "Save Changes" butonuna tıklayın

## Adım 5: Test Kullanıcısı Ekleme
1. "Roles" → "Roles" sekmesine gidin
2. "Instagram Testers" bölümünde "Add Instagram Testers" butonuna tıklayın
3. Petfendy Instagram hesabının kullanıcı adını girin
4. "Submit" butonuna tıklayın

## Adım 6: Instagram Hesabında Onay
1. Petfendy Instagram hesabına giriş yapın
2. Ayarlar → Güvenlik → Apps and Websites → Tester Invites
3. Gelen daveti onaylayın

## Adım 7: Authorization URL Oluşturma
Aşağıdaki URL'yi tarayıcınızda açın (APP_ID'yi kendi uygulama ID'nizle değiştirin):

```
https://api.instagram.com/oauth/authorize
  ?client_id={APP_ID}
  &redirect_uri=https://petfendy.com/auth/instagram/callback
  &scope=user_profile,user_media
  &response_type=code
```

**APP_ID'yi nereden bulacaksınız:**
- Meta Developer Console → Uygulamanız → Settings → Basic
- "App ID" alanındaki değer

## Adım 8: Authorization Code Alma
1. Yukarıdaki URL'yi açtığınızda Instagram'a yönlendirileceksiniz
2. Petfendy hesabıyla giriş yapın
3. İzinleri onaylayın
4. Redirect URL'de `code` parametresini kopyalayın

Örnek: `https://petfendy.com/auth/instagram/callback?code=AQD...`

## Adım 9: Short-lived Access Token Alma
Terminal veya Postman ile aşağıdaki POST isteğini yapın:

```bash
curl -X POST \
  https://api.instagram.com/oauth/access_token \
  -F client_id={APP_ID} \
  -F client_secret={APP_SECRET} \
  -F grant_type=authorization_code \
  -F redirect_uri=https://petfendy.com/auth/instagram/callback \
  -F code={AUTHORIZATION_CODE}
```

**APP_SECRET'i nereden bulacaksınız:**
- Meta Developer Console → Uygulamanız → Settings → Basic
- "App Secret" alanındaki "Show" butonuna tıklayın

## Adım 10: Long-lived Access Token Alma
Short-lived token ile long-lived token alın:

```bash
curl -i -X GET "https://graph.instagram.com/access_token
  ?grant_type=ig_exchange_token
  &client_secret={APP_SECRET}
  &access_token={SHORT_LIVED_TOKEN}"
```

## Adım 11: Token'ı Test Etme
Alınan long-lived token'ı test edin:

```bash
curl -i -X GET "https://graph.instagram.com/me/media
  ?fields=id,caption,media_type,media_url,permalink,timestamp
  &access_token={LONG_LIVED_TOKEN}"
```

## Adım 12: Environment Variable'a Ekleme
Token'ı `.env.local` dosyasına ekleyin:

```
INSTAGRAM_ACCESS_TOKEN=your-long-lived-access-token-here
```

## Token Yenileme (60 günde bir)
Long-lived token'ları yenilemek için:

```bash
curl -i -X GET "https://graph.instagram.com/refresh_access_token
  ?grant_type=ig_refresh_token
  &access_token={CURRENT_TOKEN}"
```

## Sorun Giderme
- **Invalid redirect URI**: Redirect URI'lerin tam olarak eşleşmesi gerekiyor
- **Invalid scope**: Sadece `user_profile,user_media` kullanın
- **User not authorized**: Instagram hesabının test kullanıcısı olarak eklendiğinden emin olun
- **Token expired**: 60 günde bir token yenilenmeli

## Güvenlik Notları
- App Secret'i asla paylaşmayın
- Access token'ı frontend'de saklamayın
- Token'ları düzenli olarak yenileyin
- Rate limit: 200 request/hour

---

Bu rehberi takip ederek token aldıktan sonra bana bildirin, gerekli ayarlamaları yapalım.