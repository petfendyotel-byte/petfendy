# ✅ reCAPTCHA DEPLOYMENT CHECKLIST
**Petfendy Production Deployment için Son Adımlar**

## 🎯 DURUM

✅ **Kod değişiklikleri tamamlandı**  
✅ **GitHub'a push edildi**  
⏳ **Coolify environment variables güncellenmeli**  
⏳ **Production deployment yapılmalı**

---

## 🔧 COOLIFY ENVIRONMENT VARIABLES

### Adım 1: Coolify Dashboard'a Git
🔗 **Link**: Coolify admin panel

### Adım 2: Petfendy Projesini Aç
- Projects → Petfendy
- **Environment** sekmesine git

### Adım 3: reCAPTCHA Variables'larını Güncelle

**Mevcut (Test Keys):**
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

**Yeni (Production Keys):**
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfyRFksAAAAAGKklverEm6tg-OB-RnylElD51dt
RECAPTCHA_SECRET_KEY=6LfyRFksAAAAALXfF_irQAEiCYOC_7Cd04HJCmN-
```

### Adım 4: Save & Deploy
- **Save** butonuna tıkla
- **Deploy** butonuna tıkla (otomatik deploy aktifse kendisi yapacak)

---

## 🧪 DEPLOYMENT SONRASI TEST

### Test 1: reCAPTCHA Konfigürasyon
```bash
curl https://petfendy.com/api/test-recaptcha
```

**Beklenen Sonuç:**
```json
{
  "status": "reCAPTCHA Configuration Test",
  "siteKey": "6LfyRFksAA...",
  "secretKey": "6LfyRFksAA...",
  "configured": true
}
```

### Test 2: Login Functionality
1. https://petfendy.com sitesine git
2. **Giriş** butonuna tıkla
3. Email: `petfendyotel@gmail.com`
4. Şifre: (admin şifresi)
5. **Giriş Yap** butonuna tıkla

**Beklenen Sonuç:**
- ✅ reCAPTCHA otomatik çalışır
- ✅ Başarılı giriş
- ❌ "Güvenlik doğrulaması başarısız" hatası YOK

### Test 3: Security Endpoints
```bash
# Email verification test
curl -X POST https://petfendy.com/api/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# JWT refresh test
curl -X POST https://petfendy.com/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "test-token"}'

# WAF test
curl https://petfendy.com/api/test-waf
```

---

## 🛡️ GÜVENLİK DOĞRULAMA

### Kontrol Listesi
- [ ] reCAPTCHA production keys aktif
- [ ] Login sayfası çalışıyor
- [ ] Email verification endpoints aktif
- [ ] JWT token management çalışıyor
- [ ] SMS rate limiting aktif
- [ ] WAF protection çalışıyor
- [ ] Security logging aktif

### Browser Console Kontrolü
1. F12 → Console
2. Login yapmayı dene
3. Hata mesajı olmamalı

**Beklenen Log:**
```
✅ reCAPTCHA loaded successfully
✅ Security middleware active
✅ WAF protection enabled
```

---

## 🚨 SORUN GİDERME

### Sorun 1: "reCAPTCHA not configured"
**Çözüm**: 
- Coolify environment variables kontrol et
- Deploy işlemini tekrarla
- Cache temizle

### Sorun 2: "Invalid site key"
**Çözüm**:
- Site key'i doğru kopyalandığından emin ol
- Domain whitelist'i kontrol et (petfendy.com)
- Browser cache temizle

### Sorun 3: "Build failed"
**Çözüm**:
- Coolify build logs'unu kontrol et
- Environment variables syntax'ını kontrol et
- Manual deploy dene

### Sorun 4: "Login still failing"
**Çözüm**:
- Browser Developer Tools → Network tab
- reCAPTCHA API calls'ları kontrol et
- Console errors'ları kontrol et

---

## 📊 BAŞARI KRİTERLERİ

### ✅ Deployment Başarılı Göstergeleri
- [ ] Site açılıyor (https://petfendy.com)
- [ ] Login sayfası çalışıyor
- [ ] reCAPTCHA hatası yok
- [ ] Admin dashboard'a erişim var
- [ ] Security endpoints response veriyor
- [ ] WAF protection aktif

### 📈 Performance Metrikleri
- **Page Load Time**: <3 seconds
- **reCAPTCHA Load Time**: <1 second
- **Login Response Time**: <2 seconds
- **API Response Time**: <500ms

---

## 🎉 DEPLOYMENT TAMAMLANDI

### ✅ Başarılı Deployment Sonrası

1. **Google reCAPTCHA Admin Console'u kontrol et**
   - Traffic görünmeye başlamalı
   - Score distribution normal olmalı

2. **Security monitoring başlat**
   - WAF logs'unu takip et
   - Failed login attempts'ları izle
   - Bot detection alerts'leri kontrol et

3. **User feedback topla**
   - Login experience sorunsuz mu?
   - Performance etkilendi mi?
   - False positive var mı?

---

## 📞 DESTEK

### Deployment Sorunları
- **Coolify Documentation**: Coolify docs
- **GitHub Issues**: Repository issues
- **Technical Support**: bilge.corumlu@gmail.com

### reCAPTCHA Sorunları
- **Google reCAPTCHA Help**: https://developers.google.com/recaptcha/docs/faq
- **Admin Console**: https://www.google.com/recaptcha/admin

---

**Deployment Date**: 28 Ocak 2025  
**Status**: ⏳ **PENDING COOLIFY UPDATE**  
**Next Step**: 🔧 **UPDATE ENVIRONMENT VARIABLES**  
**Priority**: 🔴 **HIGH**