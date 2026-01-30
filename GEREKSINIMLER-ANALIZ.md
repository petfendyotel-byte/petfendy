# Gereksinimler Analizi ve Uygulama Planı

## ✅ Mevcut Durum Analizi

### Var Olan Servisler
1. ✅ POS Integration Service (Ziraat ve Payten için Strategy Pattern)
2. ✅ Risk Management Service (temel seviye)
3. ✅ Idempotency Service (24 saat TTL)
4. ✅ Audit Log Service (PII maskeleme ile)
5. ✅ Notification Service (SMS, Email, Admin Panel)
6. ✅ Security Utils (PII maskeleme fonksiyonları)
7. ✅ Payment Service Secure (PCI DSS uyumlu)

### Eksikler ve Geliştirilmesi Gerekenler

## 1. ÖDEME AKIŞLARI

### 1.1 3D Secure ve Non-3D Fallback
**Durum:** Risk Management Service var ama POS entegrasyonuna tam bağlı değil

**Gereksinimler:**
- ✅ 3D Secure varsayılan zorunlu
- ⚠️ Non-3D fallback kuralları (500 TL altı, BIN listesi, velocity check, device fingerprint)
- ⚠️ 3D servis kesintisi algılama
- ⚠️ Risk skorlamasına göre Non-3D kararı
- ⚠️ Her Non-3D işlemi audit log ve admin bildirimi

**Yapılacaklar:**
- Risk yönetimi servisini genişlet (country check, IP check, device fingerprint)
- POS Integration Service'e risk değerlendirmesi ekle
- 3D servis kesintisi algılama mekanizması
- Non-3D fallback için detaylı audit log

### 1.2 Taksit Yönetimi
**Durum:** InstallmentRule type var ama yönetim paneli entegrasyonu eksik

**Gereksinimler:**
- ✅ Yönetim panelinden taksit kuralları yönetimi (min/max tutar, BIN listesi, yasak BIN'ler)
- ✅ Taksit faiz oranları yönetimi
- ⚠️ Admin panel UI'si eksik

### 1.3 Ön Provizyon
**Durum:** isPreauth flag var ama capture/void akışları eksik

**Gereksinimler:**
- ✅ Ön provizyon alma
- ⚠️ Capture akışı (7 gün içinde)
- ⚠️ Void akışı (iptal)
- ⚠️ Auto-capture yapılandırması

### 1.4 İade/İptal/Partial Refund
**Durum:** Refund fonksiyonları var

**Gereksinimler:**
- ✅ Tam iade
- ✅ Kısmi iade
- ✅ Banka üzerinden işlem (POS entegrasyonu)
- ⚠️ İade limitleri ve yetkilendirme

### 1.5 Chargeback Yönetimi
**Durum:** ChargebackTransaction type var ama servis eksik

**Gereksinimler:**
- ⚠️ Chargeback bildirimi alma
- ⚠️ Chargeback statü takibi
- ⚠️ Admin panel bildirimi
- ⚠️ SMS/E-posta bildirimi

### 1.6 Idempotency ve Retry
**Durum:** ✅ Idempotency Service mevcut (24 saat TTL)

**Gereksinimler:**
- ✅ Idempotency key oluşturma (backend)
- ✅ 24 saat TTL
- ⚠️ Retry mekanizması (network hatası için, ödeme için değil)
- ⚠️ Timeout yönetimi (10 saniye)

### 1.7 Failover
**Durum:** ✅ POS Integration Service'de failover var

**Gereksinimler:**
- ✅ Ziraat → Payten failover
- ⚠️ Failover audit log
- ⚠️ Failover istatistikleri

## 2. GÜVENLİK VE VERİ KORUMA

### 2.1 Şifre Güvenliği
**Durum:** ✅ bcrypt kullanılıyor (12 rounds)

**Gereksinimler:**
- ⚠️ Argon2id desteği ekle (daha güvenli, bcrypt fallback)
- ✅ Minimum 12 karakter
- ✅ Büyük/küçük harf, rakam, özel karakter
- ✅ Tekrar eden karakter kontrolü
- ✅ Sözlük kelime kontrolü
- ⚠️ Şifre sıfırlama token'ı (15 dakika, tek kullanımlık)
- ⚠️ Başarılı reset sonrası aktif oturumların iptali

### 2.2 Rate Limiting
**Durum:** ✅ RateLimiter class var

**Gereksinimler:**
- ⚠️ Login: 5/dk (kullanıcı + IP)
- ⚠️ MFA/OTP isteği: 3/10 dk
- ⚠️ Ödeme talebi: 3/dk kullanıcı
- ⚠️ IP bazlı genel limit
- ⚠️ Bruteforce engeli (5 hata → 15 dk kilit + e-posta)

### 2.3 MFA (Multi-Factor Authentication)
**Durum:** ❌ MFA servisi yok

**Gereksinimler:**
- ⚠️ Admin ve yüksek riskli işlemler için zorunlu
- ⚠️ Son kullanıcı için opsiyonel (TOTP/SMS)
- ⚠️ Backup codes (hashed)

### 2.4 PII Maskeleme
**Durum:** ✅ Security Utils'de maskeleme fonksiyonları var

**Gereksinimler:**
- ✅ Kart: `**** **** **** 1234`
- ✅ CVV: Hiç loglanmaz
- ✅ TC: `*** *** **123`
- ✅ Telefon: `*** *** **34`
- ✅ E-posta: `f****@d****.com`
- ✅ Log'larda PII maskesi uygulanıyor

## 3. BİLDİRİMLER

### 3.1 Ödeme Bildirimleri
**Durum:** ✅ Notification Service var

**Gereksinimler:**
- ✅ Başarılı ödeme: SMS + E-posta (kullanıcı + sistem sahibi)
- ✅ Başarısız ödeme: SMS + E-posta
- ✅ İade: SMS + E-posta
- ✅ Chargeback: SMS + E-posta + Admin Panel
- ✅ Preauth: Admin Panel
- ✅ Capture: Admin Panel
- ✅ Void: Admin Panel
- ✅ Tüm bildirimler Admin Panel'de görünmeli

### 3.2 Bildirim Sağlayıcıları
**Durum:** ✅ SMS ve Email servisleri var

**Gereksinimler:**
- ⚠️ SMS: Birincil + yedek sağlayıcı (failover)
- ⚠️ Email: Birincil + yedek sağlayıcı (failover)
- ✅ Retry mekanizması (1s, 5s, 15s)
- ⚠️ Dead-letter queue (3 deneme sonrası)
- ⚠️ Bildirim şablonları (TR/EN)

### 3.3 Admin Panel Bildirimleri
**Durum:** ✅ AdminNotification type var

**Gereksinimler:**
- ✅ Tüm ödeme statüleri için bildirim
- ⚠️ Gerçek zamanlı bildirim akışı
- ⚠️ Okunmamış bildirim sayısı
- ⚠️ Filtreleme ve export

## 4. VERİ BÜTÜNLÜĞÜ VE ATOMİKLİK

### 4.1 Transactional Outbox Pattern
**Durum:** ❌ Yok

**Gereksinimler:**
- ⚠️ Ödeme, sipariş statüsü, stok/rezerve işlemleri tek transaction
- ⚠️ Outbox pattern ile mesaj kuyruğu entegrasyonu
- ⚠️ Idempotent mesaj işleme

## 5. YÖNETİM PANELİ

### 5.1 Taksit Kuralları Yönetimi
**Durum:** ❌ UI yok

**Gereksinimler:**
- ⚠️ Taksit kuralları CRUD
- ⚠️ Min/max tutar, BIN listesi, faiz oranları

### 5.2 Ön Provizyon Yönetimi
**Durum:** ❌ UI yok

**Gereksinimler:**
- ⚠️ Capture window ayarı
- ⚠️ Auto-capture ayarı
- ⚠️ Bekleyen preauth'ları görüntüleme ve capture/void

### 5.3 Bildirim Yönetimi
**Durum:** ❌ UI eksik

**Gereksinimler:**
- ⚠️ Bildirim şablonları yönetimi
- ⚠️ Bildirim geçmişi
- ⚠️ SMS/Email sağlayıcı ayarları

## UYGULAMA PLANI

### Faz 1: Ödeme Akışları ve Güvenlik
1. Risk Management Service'i genişlet (country, IP, device fingerprint)
2. 3D failover mekanizması
3. Şifre hash: Argon2id + bcrypt fallback
4. MFA servisi
5. Rate limiting genişletme

### Faz 2: Bildirimler ve Admin Panel
1. Email servisine failover ekle
2. Bildirim şablonları genişlet
3. Admin panel bildirim UI'ı
4. Chargeback yönetimi

### Faz 3: İş Mantığı ve Yönetim
1. Ön provizyon capture/void
2. Taksit kuralları yönetim UI
3. Transactional outbox pattern
4. İade yönetimi UI

