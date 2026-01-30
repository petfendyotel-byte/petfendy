# 🔄 Coolify Mevcut Uygulama Güncelleme

## Durum: Mevcut Uygulama Güncelleniyor

Yeni uygulama oluşturmak yerine mevcut Coolify uygulamasını güncelleyeceğiz çünkü:
- ✅ Veritabanı zaten mevcut ve çalışıyor
- ✅ Domain (petfendy.com) zaten yapılandırılmış
- ✅ SSL sertifikası aktif
- ✅ Environment variables tanımlı

## 🚀 Güncelleme Adımları

### 1. GitHub Repository Durumu
- **Repository:** https://github.com/petfendyotel-byte/petfendy
- **Branch:** main
- **Son Commit:** İyzico entegrasyonu ve yasal uyumluluk güncellemeleri
- **Durum:** ✅ Güncel

### 2. Coolify'da Güncelleme

#### Yöntem 1: Otomatik Deploy (Webhook)
1. Coolify'a git: http://46.224.248.228:8000
2. Petfendy uygulamasını aç
3. "Deploy" sekmesine git
4. "Deploy" butonuna tıkla
5. GitHub'dan son kodları çekecek ve deploy edecek

#### Yöntem 2: Manuel Trigger
1. Coolify'da uygulamayı aç
2. Settings > General
3. "Force Rebuild" seçeneğini işaretle
4. "Deploy" butonuna tıkla

### 3. Güncellenen Özellikler

#### 💳 İyzico Payment Gateway
- PayTR tamamen kaldırıldı
- İyzico entegrasyonu eklendi
- Test kartları ve sandbox modu hazır

#### 📋 Yasal Politikalar
- İptal ve İade Politikası (6502 sayılı Kanun uyumlu)
- Mesafeli Satış Sözleşmesi (İyzico uyumlu)
- Ödeme Güvenliği sayfası güncellendi

#### 🔐 Güvenlik Güncellemeleri
- Content Security Policy İyzico için güncellendi
- Middleware güvenlik politikaları düzenlendi

### 4. Environment Variables Kontrolü

Coolify'da bu environment variables'ların olduğundan emin ol:

```bash
# İyzico (Yeni)
IYZICO_API_KEY=sandbox-test-key
IYZICO_SECRET_KEY=sandbox-test-secret
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
IYZICO_SUCCESS_URL=https://petfendy.com/payment/success
IYZICO_FAIL_URL=https://petfendy.com/payment/fail
IYZICO_WEBHOOK_SECRET=your-webhook-secret

# Eski PayTR variables'ları kaldır (varsa)
# PAYTR_MERCHANT_ID (kaldır)
# PAYTR_MERCHANT_KEY (kaldır)
# PAYTR_MERCHANT_SALT (kaldır)
```

### 5. Deploy Sonrası Kontroller

#### ✅ Test Edilecekler:
- [ ] Ana sayfa yükleniyor (https://petfendy.com)
- [ ] Footer'da PayTR logosu yok, İyzico referansları var
- [ ] Ödeme güvenliği sayfası İyzico'yu gösteriyor
- [ ] İptal ve iade politikası güncel (14 gün cayma hakkı)
- [ ] Mesafeli satış sözleşmesi güncel
- [ ] Admin paneli çalışıyor
- [ ] Kullanıcı kayıt/giriş çalışıyor

#### 🔧 Sorun Çıkarsa:
1. Coolify logs'ları kontrol et
2. Build errors var mı bak
3. Environment variables eksik mi kontrol et
4. Database bağlantısı çalışıyor mu kontrol et

### 6. İyzico Test

Deploy sonrası İyzico entegrasyonunu test et:
1. Admin paneline git
2. Payment Gateway ayarlarını kontrol et
3. Test kartı ile ödeme dene:
   - Kart: 5528790000000008
   - CVV: 123
   - Tarih: 12/30

### 7. Production Hazırlığı

Test başarılı olduktan sonra:
1. İyzico merchant hesabı başvurusu yap
2. Production API keys al
3. Environment variables'ları güncelle
4. SSL ve domain ayarlarını kontrol et

## 🎯 Sonuç

Mevcut Coolify uygulaması güncellenecek, yeni uygulama oluşturulmayacak. Bu şekilde:
- Veritabanı korunur
- Domain ayarları korunur
- SSL sertifikası korunur
- Sadece kod güncellenir

**Adım:** Coolify'a git ve "Deploy" butonuna tıkla! 🚀