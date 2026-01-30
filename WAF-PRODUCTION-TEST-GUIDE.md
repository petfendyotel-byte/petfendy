# WAF Production Test Guide
**Petfendy WAF ve Anti-Bot Sistemi Test Rehberi**

## 🛡️ Güvenlik Sistemi Özeti

Petfendy uygulamasında şu güvenlik katmanları aktif:

### 1. WAF (Web Application Firewall)
- **SQL Injection** koruması
- **XSS (Cross-Site Scripting)** koruması  
- **Path Traversal** koruması
- **Command Injection** koruması
- **LDAP/NoSQL Injection** koruması

### 2. Anti-Bot Sistemi
- Malicious bot detection (50+ bot signature)
- Suspicious pattern analysis
- Rate limiting per IP
- Automatic IP blocking

### 3. API Koruması
- Endpoint-specific rate limiting
- Request validation
- Attack pattern monitoring
- Real-time blocking

## 🧪 Test Senaryoları

### Test 1: WAF Konfigürasyon Kontrolü
```bash
# Test endpoint'i kontrol et
curl https://petfendy.com/api/test-recaptcha

# Beklenen sonuç: 200 OK, reCAPTCHA configured: true
```

### Test 2: WAF Test Endpoint'i
```bash
# WAF test endpoint'ini kontrol et
curl https://petfendy.com/api/test-waf

# Beklenen sonuç: Available tests listesi
```

### Test 3: SQL Injection Koruması
```bash
# SQL injection saldırısı simülasyonu
curl "https://petfendy.com/api/test-waf?test=sql&payload=' OR 1=1--"

# Beklenen sonuç: 403 Forbidden (WAF tarafından bloklanmalı)
```

### Test 4: XSS Koruması
```bash
# XSS saldırısı simülasyonu
curl "https://petfendy.com/api/test-waf?test=xss&payload=<script>alert(1)</script>"

# Beklenen sonuç: 403 Forbidden (WAF tarafından bloklanmalı)
```

### Test 5: Bot Detection
```bash
# Malicious bot user-agent ile test
curl -H "User-Agent: sqlmap/1.0" https://petfendy.com/api/test-waf

# Beklenen sonuç: 403 Forbidden (Bot olarak tespit edilmeli)
```

### Test 6: Rate Limiting
```bash
# Hızlı ardışık istekler (rate limit test)
for i in {1..60}; do
  curl https://petfendy.com/api/test-waf
  sleep 0.1
done

# Beklenen sonuç: İlk istekler 200 OK, sonrasında 429 Too Many Requests
```

### Test 7: Contact Form Koruması
```bash
# Contact form'a spam gönderimi
curl -X POST https://petfendy.com/api/send-contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "message": "Test message",
    "recaptchaToken": "invalid-token"
  }'

# Beklenen sonuç: reCAPTCHA validation error
```

## 📊 WAF Admin Dashboard Testi

### Admin Endpoint'leri (Sadece yetkili kullanıcılar)
```bash
# WAF istatistikleri
curl https://petfendy.com/api/admin/waf?action=stats

# Bloklu IP'ler
curl https://petfendy.com/api/admin/waf?action=blocked-ips

# IP bloklama
curl -X POST https://petfendy.com/api/admin/waf \
  -H "Content-Type: application/json" \
  -d '{"action": "block", "ip": "192.168.1.100"}'
```

## 🔍 Log Monitoring

### Server Log'larını Kontrol Et
```bash
# WAF log'larını kontrol et
tail -f /var/log/petfendy-waf.log

# Nginx access log'larını kontrol et  
tail -f /var/log/nginx/access.log

# Coolify application log'larını kontrol et
docker logs petfendy-app-container
```

### Beklenen Log Formatları
```
[WAF] 2025-01-27T21:30:00.000Z - WAF_BLOCKED
{
  "ip": "192.168.1.100",
  "userAgent": "sqlmap/1.0",
  "url": "/api/test-waf",
  "attacks": ["MALICIOUS_BOT", "sqli-001"],
  "severity": "critical"
}
```

## ⚠️ Güvenlik Kontrol Listesi

### ✅ Aktif Korunmalar
- [ ] SQL Injection koruması aktif
- [ ] XSS koruması aktif  
- [ ] Bot detection çalışıyor
- [ ] Rate limiting aktif
- [ ] IP blocking çalışıyor
- [ ] reCAPTCHA entegrasyonu aktif
- [ ] API endpoint'leri korunuyor
- [ ] Log'lama çalışıyor

### ✅ Performance Kontrolleri
- [ ] Normal kullanıcı trafiği etkilenmiyor
- [ ] Response time'lar normal
- [ ] False positive oranı düşük
- [ ] Memory usage normal
- [ ] CPU usage normal

## 🚨 Acil Durum Prosedürleri

### WAF'ı Geçici Olarak Devre Dışı Bırakma
```bash
# Environment variable ile WAF'ı kapat
export DISABLE_WAF=true

# Veya middleware'de bypass ekle
# middleware.ts dosyasında WAF kontrollerini comment out et
```

### Yanlış Bloklanmış IP'yi Kaldırma
```bash
# Admin API ile IP'yi unblock et
curl -X POST https://petfendy.com/api/admin/waf \
  -H "Content-Type: application/json" \
  -d '{"action": "unblock", "ip": "BLOCKED_IP_ADDRESS"}'
```

### Rate Limit'i Sıfırlama
```bash
# Development endpoint ile rate limit'i reset et
curl -X POST https://petfendy.com/api/dev/reset-rate-limit
```

## 📈 Monitoring ve Alerting

### Önemli Metrikler
- **Attack Rate**: Dakika başına saldırı sayısı
- **Block Rate**: Bloklanma oranı
- **False Positive Rate**: Yanlış pozitif oranı
- **Response Time Impact**: WAF'ın response time'a etkisi

### Alert Koşulları
- 10+ saldırı/dakika → Medium Alert
- 50+ saldırı/dakika → High Alert  
- 100+ saldırı/dakika → Critical Alert
- WAF service down → Critical Alert

## 🔧 Troubleshooting

### Yaygın Sorunlar

**1. Legitimate traffic bloklanıyor**
- WAF kurallarını gözden geçir
- Whitelist'e IP ekle
- Rate limit değerlerini artır

**2. WAF çalışmıyor**
- Environment variables'ları kontrol et
- Middleware sırasını kontrol et
- Log'larda hata mesajlarını ara

**3. Performance sorunu**
- WAF rule'larını optimize et
- Caching ekle
- Rate limit değerlerini ayarla

## 📞 Destek

Sorun yaşanması durumunda:
1. Bu dokümandaki troubleshooting adımlarını uygula
2. Log dosyalarını kontrol et
3. Geliştirici ekibi ile iletişime geç

---

**Son Güncelleme**: 27 Ocak 2025  
**Versiyon**: 1.0  
**Durum**: ✅ Production Ready