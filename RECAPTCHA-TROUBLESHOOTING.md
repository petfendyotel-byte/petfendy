# 🔧 reCAPTCHA TROUBLESHOOTING GUIDE
**Petfendy reCAPTCHA 500 Error Çözüm Rehberi**

## 🚨 MEVCUT SORUN

**Hata**: `POST https://petfendy.com/api/verify-recaptcha 500 (Internal Server Error)`  
**Belirtiler**: Login sayfasında "Güvenlik doğrulaması başarısız" hatası  
**Durum**: Enhanced debugging eklendi, root cause analizi gerekli

---

## 🔍 DEBUGGING ADIMLAR

### Adım 1: Environment Variables Kontrolü
```bash
# Debug endpoint'ini test et
curl https://petfendy.com/api/debug-recaptcha
```

**Beklenen Sonuç:**
```json
{
  "status": "reCAPTCHA Debug Information",
  "siteKey": {
    "exists": true,
    "value": "6LfyRFksAAAAAGK...",
    "isTestKey": false
  },
  "secretKey": {
    "exists": true,
    "value": "6LfyRFksAAAAALX...",
    "isTestKey": false
  },
  "configured": true
}
```

### Adım 2: Google API Connectivity Test
```bash
# Google reCAPTCHA API'yi doğrudan test et
curl -X POST https://petfendy.com/api/debug-recaptcha \
  -H "Content-Type: application/json" \
  -d '{"testToken": "test-token-123"}'
```

### Adım 3: Server Logs Kontrolü
Coolify dashboard → Logs sekmesi → Real-time logs

**Aranacak Log Patterns:**
```
🔍 [reCAPTCHA] Verify endpoint called
🔑 [reCAPTCHA] Environment check
📡 [reCAPTCHA Service] Making request to Google API
❌ [reCAPTCHA Service] Verification error
```

### Adım 4: Browser Console Detailed Logs
1. F12 → Console
2. Login yapmayı dene
3. Detaylı log'ları kontrol et

**Beklenen Logs:**
```
🔄 [Login] Executing reCAPTCHA...
🎫 [Login] reCAPTCHA token received: true
🔍 [Login] Verifying reCAPTCHA token...
📡 [Login] reCAPTCHA API response status: 200
✅ [Login] reCAPTCHA verification successful
```

---

## 🛠️ OLASI SORUNLAR VE ÇÖZÜMLER

### Sorun 1: Environment Variables Eksik/Yanlış
**Belirtiler**: `configured: false` veya `exists: false`

**Çözüm**:
1. Coolify dashboard → Environment variables
2. Şu değişkenleri kontrol et:
   ```bash
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfyRFksAAAAAGKklverEm6tg-OB-RnylElD51dt
   RECAPTCHA_SECRET_KEY=6LfyRFksAAAAALXfF_irQAEiCYOC_7Cd04HJCmN-
   ```
3. Save → Deploy

### Sorun 2: Google API Connectivity
**Belirtiler**: `HTTP error! status: 403` veya network timeout

**Çözüm**:
1. Server'ın internet erişimini kontrol et
2. Firewall kurallarını kontrol et
3. Google reCAPTCHA service status: https://status.cloud.google.com

### Sorun 3: Domain Mismatch
**Belirtiler**: `invalid-input-response` veya `bad-request`

**Çözüm**:
1. Google reCAPTCHA Admin Console: https://www.google.com/recaptcha/admin
2. Domain listesini kontrol et:
   - ✅ `petfendy.com`
   - ✅ `www.petfendy.com`
   - ✅ `46.224.248.228`
3. Eksik domain varsa ekle

### Sorun 4: Secret Key Yanlış
**Belirtiler**: `invalid-input-secret`

**Çözüm**:
1. Google reCAPTCHA Admin Console'dan secret key'i tekrar kopyala
2. Coolify environment variables'da güncelle
3. Deploy et

### Sorun 5: Rate Limiting
**Belirtiler**: `timeout-or-duplicate`

**Çözüm**:
1. Birkaç dakika bekle
2. Browser cache temizle
3. Farklı browser/incognito mode dene

---

## 🧪 MANUAL TEST SCENARIOS

### Test 1: Direct API Call
```bash
# Gerçek reCAPTCHA token ile test (browser console'dan al)
curl -X POST https://petfendy.com/api/verify-recaptcha \
  -H "Content-Type: application/json" \
  -d '{
    "token": "GERÇEK_RECAPTCHA_TOKEN_BURAYA",
    "action": "login",
    "minScore": 0.5
  }'
```

### Test 2: Frontend Integration
```javascript
// Browser console'da çalıştır
grecaptcha.execute('6LfyRFksAAAAAGKklverEm6tg-OB-RnylElD51dt', {action: 'login'})
  .then(token => {
    console.log('Token:', token);
    return fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({token, action: 'login', minScore: 0.5})
    });
  })
  .then(response => response.json())
  .then(result => console.log('Result:', result));
```

### Test 3: Environment Validation
```bash
# Server environment'ı kontrol et
curl https://petfendy.com/api/test-recaptcha
```

---

## 📊 EXPECTED VS ACTUAL RESULTS

### ✅ Expected (Working State)
```json
{
  "success": true,
  "score": 0.9,
  "message": "reCAPTCHA verification successful"
}
```

### ❌ Current (Error State)
```
500 Internal Server Error
```

### 🔍 Debug Information Needed
1. **Server logs**: Exact error message
2. **Environment check**: Variables properly set?
3. **Google API response**: What does Google return?
4. **Network connectivity**: Can server reach Google?

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Environment variables set in Coolify
- [ ] Google reCAPTCHA domains configured
- [ ] Build successful locally
- [ ] Debug endpoints working

### Post-Deployment
- [ ] `/api/debug-recaptcha` returns correct config
- [ ] Server logs show detailed debugging info
- [ ] Google reCAPTCHA admin console shows traffic
- [ ] Login form provides detailed error messages

### Rollback Plan
If issues persist:
1. Temporarily disable reCAPTCHA validation
2. Allow login without reCAPTCHA
3. Fix issues in development
4. Re-enable with proper testing

---

## 📞 NEXT STEPS

### Immediate Actions
1. **Check Coolify logs** for detailed error messages
2. **Test debug endpoint** to verify configuration
3. **Verify Google API connectivity** from server
4. **Check domain configuration** in reCAPTCHA console

### If Still Failing
1. **Temporary bypass**: Disable reCAPTCHA for critical users
2. **Alternative approach**: Use different reCAPTCHA implementation
3. **Fallback security**: Implement alternative bot protection

---

## 🔧 QUICK FIXES

### Fix 1: Temporary Bypass (Emergency)
```typescript
// In verify-recaptcha/route.ts - TEMPORARY ONLY
if (process.env.NODE_ENV === 'production' && process.env.BYPASS_RECAPTCHA === 'true') {
  return NextResponse.json({
    success: true,
    score: 0.9,
    message: 'reCAPTCHA bypassed for debugging'
  })
}
```

### Fix 2: Fallback to Test Keys (Emergency)
```bash
# Coolify environment - TEMPORARY ONLY
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

---

**Created**: 28 Ocak 2025  
**Status**: 🔍 **DEBUGGING IN PROGRESS**  
**Priority**: 🔴 **CRITICAL**  
**Next Action**: Check Coolify logs and debug endpoint