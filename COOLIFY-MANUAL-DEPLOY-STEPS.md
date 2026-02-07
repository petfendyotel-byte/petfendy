# 🚀 Coolify Manuel Deploy Adımları

## Mevcut Durum
- **Coolify'da Deploy Edilen:** `31d5d4c` (İyzico legal policies)
- **GitHub'daki Son Commit:** `32a4295` (reCAPTCHA fix)
- **Eksik Commit'ler:** 3 adet fix commit deploy edilmemiş

## ❌ Sorun
Login/Register çalışmıyor çünkü reCAPTCHA fix'leri henüz production'a deploy edilmemiş.

## ✅ Çözüm: Manuel Deploy

### Adım 1: Coolify'a Giriş
1. Tarayıcıda aç: http://46.224.248.228:8000
2. Giriş yap

### Adım 2: Petfendy Uygulamasına Git
1. Sol menüden "Projects" tıkla
2. "Petfendy" projesini seç
3. "petfendy" uygulamasını aç

**Direkt Link:**
http://46.224.248.228:8000/project/rsg4w0ogssskosooko80g4ws/environment/jgoc08cwccgwkw800oogss8g/application/vckgcw40o0wkcsswsc4okgkc

### Adım 3: Deploy Et
1. Sağ üstte **"Deploy"** butonunu bul
2. Butona tıkla
3. Deployment başlayacak

### Adım 4: Build Loglarını İzle
1. "Show Logs" veya "Deployment Logs" tıkla
2. Build sürecini izle
3. Hata olursa logları oku

### Adım 5: Deploy Tamamlandığında Test Et
1. https://petfendy.com/tr adresine git
2. "Giriş Yap" butonuna tıkla
3. Email ve şifre gir
4. Giriş yapabilmeli ✅

## 📋 Deploy Edilecek Fix'ler

### 1. `bd65dd2` - Duplicate Export Fix
- İyzico service'de duplicate export hatası düzeltildi
- Build başarılı olacak

### 2. `e6caacc` - reCAPTCHA Optional in APIs
- Login ve Register API'lerinde reCAPTCHA opsiyonel yapıldı
- Token yoksa da giriş yapılabilir

### 3. `32a4295` - reCAPTCHA Optional in Auth Context
- Auth context'te reCAPTCHA token'ı sadece varsa gönderiliyor
- Boş string yerine undefined kullanılıyor

## ⏱️ Beklenen Süre
- Build: ~2-3 dakika
- Deploy: ~30 saniye
- Toplam: ~3-4 dakika

## 🔍 Sorun Giderme

### Build Başarısız Olursa:
1. Logs'u oku
2. Hata mesajını kopyala
3. Bana gönder

### Deploy Başarılı Ama Hala Çalışmıyorsa:
1. Browser cache'i temizle (Ctrl+Shift+R)
2. Incognito/Private modda dene
3. Console'da hata var mı kontrol et (F12)

## 📝 Deploy Sonrası Kontrol Listesi

- [ ] Build başarılı
- [ ] Application "Running" durumda
- [ ] https://petfendy.com açılıyor
- [ ] Login formu görünüyor
- [ ] Email/şifre girince giriş yapılabiliyor
- [ ] Kayıt ol çalışıyor
- [ ] Console'da reCAPTCHA hatası yok

## 🎯 Beklenen Sonuç

Login yaparken:
- ❌ Önceki Hata: "Güvenlik doğrulaması başarısız" (400 Bad Request)
- ✅ Yeni Durum: Başarılı giriş veya "E-posta/şifre hatalı" (kullanıcı yoksa)

## 💡 Not

reCAPTCHA şu an opsiyonel. İleride production'da aktif etmek için:
```bash
# Coolify Environment Variables'a ekle:
RECAPTCHA_SECRET_KEY=your-production-key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-production-site-key
```

**Şimdi Yapılacak:** Coolify'a git ve Deploy butonuna tıkla! 🚀