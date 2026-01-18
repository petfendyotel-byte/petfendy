# NetGSM SMS Konfigürasyonu - Petfendy

## ✅ Yapılandırma Tamamlandı

### NetGSM Alt Kullanıcı Bilgileri
- **Alt Kullanıcı Adı:** bilge.corumlu@gmail.com
- **Alt Kullanıcı Şifresi:** Netgsm.petfendy52707.
- **Gönderici Adı:** PETFENDY
- **API Yetkisi:** Aktif (Alt kullanıcıya API yetkisi verilmiş)

### Environment Variables (.env.local)
```env
SMS_PROVIDER=netgsm
NETGSM_USERNAME=bilge.corumlu@gmail.com
NETGSM_PASSWORD=Netgsm.petfendy52707.
NETGSM_SENDER=PETFENDY
```

### NetGSM Panel Durumu
✅ **Alt Kullanıcı Oluşturuldu:** bilge.corumlu@gmail.com  
✅ **API Yetkisi Verildi:** Alt kullanıcıya SMS API yetkisi tanımlandı  
⏳ **Gönderici Adı Durumu:** "PETFENDY" onay durumu kontrol edilmeli  
⏳ **Kredi Durumu:** SMS kredisi kontrol edilmeli

## SMS Test API

### Test Endpoint
`POST /api/test-sms`

### Test Örnekleri

#### 1. Hoş Geldin SMS'i Test Et
```bash
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "05321234567",
    "type": "welcome",
    "name": "Ahmet Yılmaz"
  }'
```

#### 2. Doğrulama Kodu SMS'i Test Et
```bash
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "05321234567",
    "type": "verification"
  }'
```

#### 3. Rezervasyon Onay SMS'i Test Et
```bash
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "05321234567",
    "type": "booking"
  }'
```

#### 4. Ödeme Başarılı SMS'i Test Et
```bash
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "05321234567",
    "type": "payment"
  }'
```

## SMS Türleri

### Müşteri SMS'leri
1. **Hoş Geldin Mesajı** - Yeni üyelik
2. **Doğrulama Kodu** - Telefon doğrulama (15 dk geçerli)
3. **Rezervasyon Onayı** - Pet otel/taksi rezervasyonu
4. **Ödeme Bildirimleri** - Başarılı/başarısız ödeme
5. **Hatırlatma** - Rezervasyon hatırlatması
6. **İptal/İade** - Rezervasyon iptali ve iade bildirimleri

### İşletme Bildirimleri
1. **Yeni Üye** - İşletme sahibine bildirim
2. **Yeni Rezervasyon** - İşletme sahibine bildirim
3. **Ödeme Alındı** - İşletme sahibine bildirim

## NetGSM Panel Kontrolleri

### Gerekli Kontroller
1. **API Erişimi:** XML API aktif olmalı
2. **Gönderici Adı:** "PETFENDY" onaylanmalı
3. **Kredi/Bakiye:** Yeterli SMS kredisi olmalı
4. **IP Kısıtlaması:** Gerekirse sunucu IP'si eklenmiş olmalı

### API Detayları
- **Endpoint:** https://api.netgsm.com.tr/sms/send/xml
- **Method:** POST (XML)
- **Başarı Kodları:** 00, 01, 02
- **Telefon Format:** 90 ile başlayan (örn: 905321234567)

## Test Adımları

1. **Localhost'ta Test:**
   ```bash
   npm run dev
   # Tarayıcıda: http://localhost:3000/api/test-sms
   ```

2. **Postman/Insomnia ile Test:**
   - POST isteği gönder
   - JSON body ile telefon numarası ve SMS türü belirt

3. **Console Logları:**
   - Başarılı: `✅ [NetGSM] SMS sent to 905321234567`
   - Hatalı: `❌ [NetGSM] Error: [hata kodu]`

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 00  | Başarılı |
| 01  | Başarılı (farklı format) |
| 02  | Başarılı (farklı format) |
| 20  | Mesaj metninde hata var |
| 30  | Geçersiz kullanıcı adı/şifre |
| 40  | Mesaj başlığı (header) onaylanmamış |
| 70  | Hatalı sorgulama |

## Güvenlik Notları

- ⚠️ **Şifreleri asla kod içinde hardcode etmeyin**
- ⚠️ **Environment dosyalarını Git'e commit etmeyin**
- ⚠️ **Production'da IP kısıtlaması kullanın**
- ⚠️ **SMS limitlerini kontrol edin**

## Sonraki Adımlar

1. **Test Et:** Kendi telefon numaranızla test edin
2. **Gönderici Onayı:** NetGSM'de "PETFENDY" gönderici adını onaylatın
3. **Kredi Yükle:** Yeterli SMS kredisi yükleyin
4. **Production Deploy:** Coolify'da environment variable'ları ekleyin

---

**Not:** SMS servisi şu anda tamamen yapılandırılmış durumda. Test API'si ile farklı SMS türlerini test edebilirsiniz.