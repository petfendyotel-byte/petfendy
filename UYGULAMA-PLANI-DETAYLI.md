# Detaylı Uygulama Planı - Ödeme ve Güvenlik Gereksinimleri

## Özet
Bu döküman, konuşmada belirlenen tüm gereksinimlerin adım adım uygulama planını içerir.

## Uygulama Aşamaları

### AŞAMA 1: Güvenlik ve Şifre Yönetimi Geliştirmeleri

#### 1.1 Argon2id Şifre Hash Desteği
**Dosya:** `lib/security.ts`
**Değişiklikler:**
- Argon2id kütüphanesi ekle (package.json)
- `hashPassword` fonksiyonunu genişlet (Argon2id öncelikli, bcrypt fallback)
- Argon2id parametreleri: memoryCost: 65536, timeCost: 3, parallelism: 4

#### 1.2 Şifre Sıfırlama İyileştirmeleri
**Dosya:** `lib/auth-service.ts` (yeni)
- Tek kullanımlık token oluşturma
- 15 dakika TTL
- Başarılı reset sonrası aktif oturumları iptal etme

#### 1.3 MFA Servisi
**Dosya:** `lib/mfa-service.ts` (yeni)
- TOTP desteği
- SMS OTP desteği
- Backup codes (hashed)
- Admin ve yüksek riskli işlemler için zorunlu MFA

### AŞAMA 2: Rate Limiting Geliştirmeleri

#### 2.1 Gelişmiş Rate Limiter
**Dosya:** `lib/rate-limiter-service.ts` (yeni)
**Gereksinimler:**
- Login: 5/dk (kullanıcı + IP)
- MFA/OTP isteği: 3/10 dk
- Ödeme talebi: 3/dk kullanıcı
- IP bazlı genel limit
- Bruteforce engeli: 5 hata → 15 dk kilit + e-posta bildirimi

### AŞAMA 3: Risk Yönetimi Geliştirmeleri

#### 3.1 Risk Management Service Genişletme
**Dosya:** `lib/risk-management-service.ts`
**Eklenecekler:**
- Country/IP kontrolü
- Device fingerprint doğrulama
- 3D servis kesintisi algılama
- Detaylı risk skorlaması
- Non-3D fallback kuralları (500 TL, BIN listesi, velocity)

#### 3.2 3D Failover Entegrasyonu
**Dosya:** `lib/pos-integration.ts`
- Risk değerlendirmesi entegrasyonu
- 3D → Non-3D geçiş mantığı
- Failover audit logging

### AŞAMA 4: Ödeme Akışları

#### 4.1 Ön Provizyon Yönetimi
**Dosya:** `lib/preauth-service.ts` (yeni)
- Capture akışı (7 gün içinde)
- Void akışı
- Auto-capture yapılandırması
- Bekleyen preauth listesi

#### 4.2 Chargeback Yönetimi
**Dosya:** `lib/chargeback-service.ts` (yeni)
- Chargeback bildirimi alma
- Statü takibi
- Admin panel bildirimi
- SMS/E-posta bildirimi

#### 4.3 İade/İptal Geliştirmeleri
**Dosya:** `lib/pos-integration.ts`
- Kısmi iade desteği
- İade limitleri
- Yetkilendirme kontrolü

### AŞAMA 5: Bildirim Sistemleri

#### 5.1 Email Servisi Failover
**Dosya:** `lib/email-service.ts`
- Birincil + yedek sağlayıcı desteği
- Failover mekanizması
- Retry logic

#### 5.2 Bildirim Şablonları
**Dosya:** `lib/notification-templates.ts` (yeni)
- TR/EN şablonlar
- Ödeme, iade, chargeback şablonları
- Değişken desteği

#### 5.3 Admin Panel Bildirim Entegrasyonu
**Dosya:** `components/admin-dashboard.tsx`
- Gerçek zamanlı bildirim akışı
- Okunmamış bildirim sayısı
- Filtreleme ve export

### AŞAMA 6: Veri Bütünlüğü

#### 6.1 Transactional Outbox Pattern
**Dosya:** `lib/outbox-service.ts` (yeni)
- Atomik işlem güvencesi
- Mesaj kuyruğu entegrasyonu
- Idempotent mesaj işleme

### AŞAMA 7: Yönetim Paneli UI

#### 7.1 Taksit Kuralları Yönetimi
**Dosya:** `components/taksit-yonetimi.tsx` (yeni)
- CRUD operasyonları
- Min/max tutar ayarları
- BIN listesi yönetimi
- Faiz oranları

#### 7.2 Ön Provizyon Yönetimi
**Dosya:** `components/preauth-yonetimi.tsx` (yeni)
- Bekleyen preauth listesi
- Capture/void butonları
- Capture window ayarları

#### 7.3 Bildirim Yönetimi
**Dosya:** `components/bildirim-yonetimi.tsx` (yeni)
- Şablon yönetimi
- Bildirim geçmişi
- Sağlayıcı ayarları

## Teknik Detaylar

### Şifre Hash: Argon2id
```typescript
// lib/security.ts'ye eklenecek
import argon2 from 'argon2'

async function hashPasswordArgon2id(password: string): Promise<string> {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    })
  } catch (error) {
    // Fallback to bcrypt
    return hashPasswordBcrypt(password)
  }
}
```

### Rate Limiting: Gelişmiş
```typescript
// lib/rate-limiter-service.ts
class AdvancedRateLimiter {
  // Kullanıcı + IP bazlı limit
  // Window-based sliding
  // Bruteforce detection
}
```

### Risk Yönetimi: Detaylı
```typescript
// lib/risk-management-service.ts genişletilecek
async assessRisk(params: {
  amount: number
  cardBIN?: string
  deviceFingerprint?: string
  userId?: string
  ipAddress?: string
  country?: string
  // ... diğer parametreler
}): Promise<RiskAssessment>
```

## Dosya Yapısı

```
lib/
├── security.ts (güncellenecek - Argon2id)
├── auth-service.ts (yeni - şifre reset)
├── mfa-service.ts (yeni)
├── rate-limiter-service.ts (yeni)
├── risk-management-service.ts (güncellenecek)
├── preauth-service.ts (yeni)
├── chargeback-service.ts (yeni)
├── email-service.ts (güncellenecek - failover)
├── notification-templates.ts (yeni)
├── outbox-service.ts (yeni)
└── pos-integration.ts (güncellenecek - risk entegrasyonu)

components/
├── taksit-yonetimi.tsx (yeni)
├── preauth-yonetimi.tsx (yeni)
├── bildirim-yonetimi.tsx (yeni)
└── admin-dashboard.tsx (güncellenecek - bildirimler)
```

## Paket Bağımlılıkları

```json
{
  "dependencies": {
    "argon2": "^0.31.0", // Şifre hash için
    "otplib": "^12.0.1", // TOTP için MFA
    "qrcode": "^1.5.3" // QR kod için TOTP
  }
}
```

## Öncelik Sırası

1. **YÜKSEK ÖNCELİK:**
   - Şifre güvenliği (Argon2id)
   - Rate limiting
   - 3D failover
   - Bildirim sistemi iyileştirmeleri

2. **ORTA ÖNCELİK:**
   - MFA servisi
   - Chargeback yönetimi
   - Ön provizyon yönetimi
   - Admin panel UI'ları

3. **DÜŞÜK ÖNCELİK:**
   - Transactional outbox
   - Taksit kuralları UI
   - Bildirim şablonları yönetimi

## Test Senaryoları

1. **3D Failover Testi:**
   - 3D servis kesintisi simülasyonu
   - Non-3D fallback doğrulama
   - Risk skoru kontrolü

2. **Rate Limiting Testi:**
   - Login bruteforce engeli
   - Ödeme talebi limiti
   - IP bazlı limit

3. **Bildirim Testi:**
   - Failover senaryoları
   - Retry mekanizması
   - Dead-letter queue

## Notlar

- Tüm değişiklikler mevcut yapıyı bozmadan yapılacak
- SOLID prensiplere uyulacak
- Her işlem atomik olacak
- Veri bütünlüğü sağlanacak
- PII maskeleme her yerde uygulanacak

