# 🔐 PETFENDY reCAPTCHA KURULUM REHBERİ
**Google reCAPTCHA v3 Gerçek Anahtarları Oluşturma**

## 🚨 SORUN

Şu anda test reCAPTCHA anahtarları kullanılıyor:
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` (TEST)
- `RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe` (TEST)

**Bu test anahtarları sadece localhost'ta çalışır, production'da çalışmaz!**

---

## ✅ ÇÖZÜM: Gerçek reCAPTCHA Anahtarları Oluştur

### Adım 1: Google reCAPTCHA Admin Console'a Git
🔗 **Link**: https://www.google.com/recaptcha/admin

### Adım 2: Google Hesabı ile Giriş Yap
- Gmail hesabınızla giriş yapın
- Eğer hesabınız yoksa, yeni Gmail hesabı oluşturun

### Adım 3: Yeni Site Ekle
1. **"+"** butonuna tıklayın (Create)
2. **Label**: `Petfendy Production` yazın
3. **reCAPTCHA type**: **reCAPTCHA v3** seçin
4. **Domains** kısmına şunları ekleyin:
   ```
   petfendy.com
   www.petfendy.com
   46.224.248.228
   localhost
   127.0.0.1
   ```

### Adım 4: Terms of Service'i Kabul Et
- ✅ Accept the reCAPTCHA Terms of Service
- **Submit** butonuna tıkla

### Adım 5: Anahtarları Kopyala
Oluşturulduktan sonra 2 anahtar göreceksiniz:

#### Site Key (Public - Frontend'de kullanılır)
```
6Lc...AAAAAAA... (örnek)
```

#### Secret Key (Private - Backend'de kullanılır)
```
6Lc...AAAAAAA... (örnek)
```

---

## 🔧 ANAHTARLARI GÜNCELLEME

### Adım 1: .env.local Dosyasını Güncelle
```bash
# Eski test anahtarlarını değiştir:
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=BURAYA_SITE_KEY_YAPISTIR
RECAPTCHA_SECRET_KEY=BURAYA_SECRET_KEY_YAPISTIR
```

### Adım 2: Coolify Environment Variables'ları Güncelle
1. Coolify dashboard'a git
2. Petfendy projesini aç
3. **Environment** sekmesine git
4. Şu değişkenleri güncelle:
   ```
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=GERÇEK_SITE_KEY
   RECAPTCHA_SECRET_KEY=GERÇEK_SECRET_KEY
   ```

### Adım 3: Uygulamayı Yeniden Deploy Et
```bash
# Manuel deploy
git add .
git commit -m "Update reCAPTCHA keys to production"
git push origin main

# Coolify otomatik deploy edecek
```

---

## 🧪 TEST ETME

### Test 1: reCAPTCHA Konfigürasyon Kontrolü
```bash
curl https://petfendy.com/api/test-recaptcha
```

**Beklenen Sonuç:**
```json
{
  "status": "reCAPTCHA Configuration Test",
  "siteKey": "6Lc...AAAA...",
  "secretKey": "6Lc...AAAA...",
  "configured": true
}
```

### Test 2: Login Testi
1. https://petfendy.com sitesine git
2. **Giriş** butonuna tıkla
3. Email ve şifre gir
4. **Giriş Yap** butonuna tıkla

**Beklenen Sonuç:** ✅ Başarılı giriş (reCAPTCHA hatası yok)

### Test 3: Browser Console Kontrolü
1. F12 tuşuna bas (Developer Tools)
2. **Console** sekmesine git
3. Login yapmayı dene
4. reCAPTCHA ile ilgili hata olmamalı

---

## 🔍 SORUN GİDERME

### Sorun 1: "Invalid site key" hatası
**Çözüm**: Site key'i kontrol et, doğru kopyalandığından emin ol

### Sorun 2: "Invalid domain" hatası
**Çözüm**: reCAPTCHA admin console'da domain'leri kontrol et:
- `petfendy.com` ✅
- `www.petfendy.com` ✅
- `46.224.248.228` ✅

### Sorun 3: "reCAPTCHA is not loaded" hatası
**Çözüm**: 
1. Internet bağlantısını kontrol et
2. Firewall/AdBlock'u kontrol et
3. Browser cache'i temizle

### Sorun 4: Düşük reCAPTCHA Score
**Çözüm**: 
1. `minScore` değerini düşür (0.3'e)
2. Kullanıcı davranışını analiz et
3. Bot trafiği kontrol et

---

## ⚙️ GELİŞMİŞ AYARLAR

### reCAPTCHA Score Threshold Ayarlama
```typescript
// login-form.tsx içinde
const recaptchaResult = await recaptchaResponse.json()
// minScore: 0.5 → 0.3 (daha esnek)
```

### Domain Whitelist Genişletme
reCAPTCHA admin console'da:
```
petfendy.com
www.petfendy.com
46.224.248.228
*.petfendy.com
localhost
127.0.0.1
```

### Analytics ve Monitoring
reCAPTCHA admin console'da:
- **Analytics** sekmesinde trafik analizi
- **Security** sekmesinde bot detection
- **Settings** sekmesinde threshold ayarları

---

## 📊 BAŞARI KRİTERLERİ

### ✅ Başarılı Kurulum Göstergeleri:
- [ ] Login sayfası reCAPTCHA hatası vermiyor
- [ ] `/api/test-recaptcha` endpoint'i `configured: true` dönüyor
- [ ] Browser console'da reCAPTCHA hatası yok
- [ ] Kullanıcılar başarılı şekilde giriş yapabiliyor
- [ ] reCAPTCHA admin console'da trafik görünüyor

### 📈 Monitoring Metrikleri:
- **Success Rate**: >95%
- **False Positive Rate**: <5%
- **Average Score**: >0.7
- **Bot Detection**: Aktif

---

## 🚀 SONRAKI ADIMLAR

### 1. Gerçek Anahtarları Oluştur (ÖNCELİK)
- Google reCAPTCHA admin console'a git
- Yukarıdaki adımları takip et
- Anahtarları .env.local'e ekle

### 2. Production'a Deploy Et
- Environment variables'ları güncelle
- Uygulamayı yeniden deploy et
- Test et

### 3. Monitoring Kur
- reCAPTCHA analytics'i kontrol et
- Error rate'leri izle
- User feedback'i topla

---

## 📞 DESTEK

### reCAPTCHA ile İlgili Sorunlar:
- **Google reCAPTCHA Help**: https://developers.google.com/recaptcha/docs/faq
- **Community Support**: https://groups.google.com/forum/#!forum/recaptcha

### Petfendy Teknik Destek:
- **Email**: bilge.corumlu@gmail.com
- **Phone**: 0532 307 32 64

---

**Oluşturulma Tarihi**: 28 Ocak 2025  
**Durum**: 🔄 **KURULUM GEREKLİ**  
**Öncelik**: 🔴 **YÜKSEK** (Production sorunu)