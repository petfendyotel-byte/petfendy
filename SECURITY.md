# 🔒 Petfendy Güvenlik Dokümantasyonu

## Güvenlik Önlemleri

Bu proje, endüstri standartlarına uygun güvenlik önlemleri ile geliştirilmiştir.

### 1. 💳 PCI DSS Uyumluluğu (Kart Güvenliği)

#### Uyguladığımız PCI DSS Gereksinimleri:

✅ **Requirement 3**: Kart verileri asla saklanmaz
- Kart numaraları hiçbir zaman veritabanına yazılmaz
- CVV/CVC kodları işlem sonrası hemen silinir
- Sadece tokenize edilmiş kart referansları saklanır
- Son 4 hane dışında maskeleme yapılır

✅ **Requirement 4**: Şifreli iletişim
- TLS 1.2+ zorunlu
- Kart verileri AES-256 ile şifrelenir
- End-to-end encryption

✅ **Requirement 8**: Kimlik doğrulama
- Güçlü şifre politikası
- Bcrypt ile hash (12 rounds)
- JWT token tabanlı oturum yönetimi

✅ **Requirement 10**: Güvenlik logları
- Tüm işlemler loglanır (hassas veri olmadan)
- IP, timestamp, işlem tipi kaydedilir

#### Kart Doğrulama:
```typescript
- Luhn algorithm ile kart numarası doğrulama
- CVV format doğrulama (3-4 hane)
- Expiry date kontrolü
- Kart tipi tespiti (Visa, Mastercard, vb.)
```

### 2. 🛡️ Web Güvenliği

#### Güvenlik Header'ları:
```
✅ Strict-Transport-Security: HTTPS zorlama
✅ X-Frame-Options: Clickjacking koruması
✅ X-Content-Type-Options: MIME sniffing koruması
✅ X-XSS-Protection: XSS filter
✅ Content-Security-Policy: Injection koruması
✅ Referrer-Policy: Bilgi sızıntısı önleme
```

#### XSS (Cross-Site Scripting) Koruması:
- Tüm kullanıcı girdileri sanitize edilir
- HTML encoding
- CSP headers
- React'in built-in XSS koruması

#### CSRF (Cross-Site Request Forgery) Koruması:
- CSRF token doğrulama
- SameSite cookie attribute
- Origin/Referer header kontrolü

### 3. 🔐 Şifreleme ve Hashing

#### Kullanılan Algoritmalar:
- **Şifreler**: bcrypt (12 rounds salt)
- **Hassas veri**: AES-256
- **Token'lar**: SHA-256
- **JWT**: HS256 (HMAC-SHA256)

#### Örnekler:
```typescript
// Şifre hashleme
const hashedPassword = await hashPassword(password);

// Veri şifreleme
const encrypted = encryptData(sensitiveData);

// JWT oluşturma
const token = generateToken(userId, email, role);
```

### 4. 🚫 Rate Limiting ve DDoS Koruması

#### Limitler:
- **Genel**: 100 istek / 15 dakika
- **Login**: 5 deneme / 15 dakika
- **Payment**: 10 istek / 5 dakika

#### Brute Force Koruması:
```typescript
// Başarısız login denemeleri izlenir
// 5 başarısız denemeden sonra hesap geçici kilitlenir
// IP bazlı rate limiting
```

### 5. 🔍 Güvenlik Logları

#### Loglanan Olaylar:
- ✅ Başarılı/başarısız login denemeleri
- ✅ Şüpheli aktiviteler
- ✅ Rate limit aşımları
- ✅ Ödeme işlemleri (kart bilgisi OLMADAN)
- ✅ SQL injection/XSS denemeleri

#### Log Formatı:
```json
{
  "timestamp": "2025-10-25T17:00:00Z",
  "type": "LOGIN_FAILED",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "details": "Invalid credentials"
}
```

**ÖNEMLİ**: Loglarda asla şunlar yer almaz:
- ❌ Şifreler
- ❌ Kart numaraları
- ❌ CVV
- ❌ JWT secret'lar

### 6. 🔑 Token ve Oturum Yönetimi

#### JWT Token Yapısı:
```typescript
{
  userId: string,
  email: string,
  role: 'user' | 'admin',
  iat: number,  // Issued at
  exp: number   // Expiration (24 saat)
}
```

#### Güvenlik Özellikleri:
- Access token: 24 saat
- Refresh token: 7 gün
- Token rotation
- Blacklist desteği

### 7. 🌐 API Güvenliği

#### Best Practices:
```typescript
// ✅ Input validation
// ✅ Output sanitization
// ✅ Error handling (no sensitive info in errors)
// ✅ CORS policy
// ✅ Request size limits
```

### 8. 📋 Güvenlik Kontrol Listesi

#### Geliştirme:
- [x] Environment variables kullanımı
- [x] Hassas bilgiler .gitignore'da
- [x] Dependency güvenlik taraması
- [x] Input validation
- [x] Output encoding
- [x] Error handling
- [x] Logging (without sensitive data)

#### Production:
- [ ] HTTPS zorunlu
- [ ] Güvenlik headers aktif
- [ ] Rate limiting aktif
- [ ] WAF (Web Application Firewall)
- [ ] SSL/TLS sertifikaları
- [ ] Güvenlik izleme (Sentry, DataDog)
- [ ] Backup stratejisi
- [ ] Incident response planı

## 🚨 Güvenlik Açığı Bildirimi

Bir güvenlik açığı bulursanız:

1. **security@petfendy.com** adresine e-posta gönderin
2. Detaylı açıklama ve PoC (Proof of Concept) ekleyin
3. Sorumlu açıklama (Responsible Disclosure) yapın
4. Public disclosure öncesi 90 gün bekleyin

## 📚 Kaynaklar ve Standartlar

### Uyulan Standartlar:
- **OWASP Top 10**: Web uygulama güvenliği
- **PCI DSS**: Kart bilgileri güvenliği
- **GDPR/KVKK**: Kişisel veri koruma
- **ISO 27001**: Bilgi güvenliği yönetimi

### Faydalı Linkler:
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [PCI Security Standards](https://www.pcisecuritystandards.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## 🔄 Güvenlik Güncellemeleri

### Yapılması Gerekenler:
1. **Dependency Updates**: Her hafta
2. **Security Patches**: Hemen
3. **Penetration Testing**: Her 6 ayda bir
4. **Code Audit**: Her 3 ayda bir
5. **Secret Rotation**: Her 90 günde bir

## ⚠️ Önemli Notlar

### Production Deployment Öncesi:
1. `.env.example` dosyasını `.env.local` olarak kopyalayın
2. Tüm secret'ları güçlü, random değerlerle değiştirin
3. `openssl rand -base64 32` ile secret üretin
4. Asla secret'ları commit etmeyin
5. Environment variables'ı güvenli bir şekilde yönetin

### Test Kartları (Geliştirme):
```
Kart Numarası: 4242 4242 4242 4242
Expiry: 12/25
CVV: 123
```

**UYARI**: Production'da asla test kartları kullanmayın!

---

**Son Güncelleme**: 25 Ekim 2025
**Versiyon**: 1.0.0
**Yazar**: Petfendy Security Team

