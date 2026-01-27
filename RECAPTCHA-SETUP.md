# Google reCAPTCHA v3 Kurulum Rehberi

Bu rehber, Petfendy uygulamasında Google reCAPTCHA v3 entegrasyonunun nasıl kurulacağını açıklar.

## 🔧 Kurulum Adımları

### 1. Google reCAPTCHA Admin Console'da Site Oluşturma

1. [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)'a gidin
2. "+" butonuna tıklayarak yeni site ekleyin
3. Aşağıdaki bilgileri doldurun:
   - **Label**: Petfendy
   - **reCAPTCHA type**: reCAPTCHA v3 seçin
   - **Domains**: 
     - `localhost` (geliştirme için)
     - `petfendy.com` (production için)
     - `46.224.248.228` (sunucu IP'si)
     - `*.sslip.io` (test domainleri için)

### 2. API Anahtarlarını Alma

Kurulum tamamlandıktan sonra iki anahtar alacaksınız:
- **Site Key** (Public): Frontend'de kullanılır
- **Secret Key** (Private): Backend'de kullanılır

### 3. Environment Variables Ayarlama

`.env.local` dosyanıza aşağıdaki değişkenleri ekleyin:

```bash
# Google reCAPTCHA v3 (Bot Koruması)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

**⚠️ Önemli Notlar:**
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` prefix'i ile başlar (frontend'de kullanılır)
- `RECAPTCHA_SECRET_KEY` prefix'i YOKTUR (sadece backend'de kullanılır)
- Secret key'i asla frontend kodunda kullanmayın!

### 4. Test Etme

Kurulum tamamlandıktan sonra aşağıdaki formlarda reCAPTCHA çalışacaktır:

- ✅ **Giriş Formu** (`/login`)
- ✅ **Kayıt Formu** (`/register`)
- ✅ **İletişim Formu** (`/iletisim`)
- ✅ **Hotel Rezervasyon** (`/booking/hotel`)
- ✅ **Taksi Rezervasyon** (`/booking/taxi`)

## 🛡️ Güvenlik Özellikleri

### reCAPTCHA v3 Avantajları

1. **Kullanıcı Dostu**: Kullanıcıdan herhangi bir etkileşim gerektirmez
2. **Akıllı Analiz**: Kullanıcı davranışlarını analiz eder (0.0-1.0 arası skor)
3. **Gerçek Zamanlı**: Her form gönderiminde otomatik çalışır
4. **Spam Koruması**: Bot trafiğini etkili şekilde engeller

### Skor Sistemi

- **1.0**: İnsan kullanıcı (en güvenli)
- **0.5**: Orta risk (varsayılan eşik)
- **0.0**: Bot (en riskli)

Uygulamamızda **0.5** eşik değeri kullanılmaktadır.

### Korunan Aksiyonlar

- `login`: Giriş formu
- `register`: Kayıt formu
- `contact`: İletişim formu
- `hotel_booking`: Hotel rezervasyonu
- `taxi_booking`: Taksi rezervasyonu

## 🔍 Sorun Giderme

### Yaygın Hatalar

1. **"reCAPTCHA site key is required"**
   - `.env.local` dosyasında `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` tanımlı mı?
   - Sunucuyu yeniden başlattınız mı?

2. **"Security verification failed"**
   - Secret key doğru mu?
   - Domain listesinde mevcut domain var mı?
   - İnternet bağlantısı çalışıyor mu?

3. **"reCAPTCHA is not loaded"**
   - İnternet bağlantısını kontrol edin
   - Tarayıcı console'da JavaScript hataları var mı?
   - Ad blocker reCAPTCHA'yı engelliyor olabilir

### Debug Modu

Geliştirme sırasında console'da reCAPTCHA loglarını görmek için:

```javascript
// Browser console'da
localStorage.setItem('recaptcha_debug', 'true')
```

## 📊 Monitoring

### Admin Panel

Google reCAPTCHA Admin Console'da aşağıdaki metrikleri izleyebilirsiniz:

- Günlük istek sayısı
- Skor dağılımı
- Engellenen bot trafiği
- Domain bazlı istatistikler

### Uygulama Logları

Sunucu loglarında reCAPTCHA doğrulama sonuçları görüntülenir:

```
[reCAPTCHA] Verification successful: score=0.9, action=login
[reCAPTCHA] Verification failed: score=0.1, action=register
```

## 🚀 Production Deployment

Production'a deploy etmeden önce:

1. ✅ Production domain'ini reCAPTCHA console'a ekleyin
2. ✅ Environment variables'ları production sunucusuna kopyalayın
3. ✅ HTTPS kullandığınızdan emin olun
4. ✅ Test formlarını production'da deneyin

## 📞 Destek

Sorun yaşarsanız:

1. Bu dokümantasyonu tekrar okuyun
2. Google reCAPTCHA [resmi dokümantasyonunu](https://developers.google.com/recaptcha/docs/v3) inceleyin
3. Geliştirici ekibi ile iletişime geçin

---

**Son Güncelleme**: 27 Ocak 2025
**Versiyon**: reCAPTCHA v3
**Durum**: ✅ Aktif ve Çalışıyor