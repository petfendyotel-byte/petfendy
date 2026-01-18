# NetGSM SMS Konfigürasyonu - Petfendy

## ✅ Yapılandırma Tamamlandı

### NetGSM API Yetkilisi Bilgileri
- **Ad Soyad:** BİLGE GÜLER
- **Telefon:** 5053921293
- **E-posta:** petfendyotel@gmail.com
- **Kullanım Amacı:** Rezervasyon bildirimi, üyelik bildirimleri
- **İçerik Türü:** Sadece ticari içerik gönderir (Bireysel Alıcılarınıza)
- **Kayıt Tarihi:** 18.01.2026 20:39:20

### Environment Variables (.env.local)
```env
SMS_PROVIDER=netgsm
NETGSM_USERNAME=bilge.corumlu@gmail.com
NETGSM_PASSWORD=Netgsm.petfendy52707.
NETGSM_SENDER=PETFENDY
ADMIN_PHONE=5053921293
```

### NetGSM Panel Durumu
✅ **Alt Kullanıcı Oluşturuldu:** bilge.corumlu@gmail.com  
✅ **API Yetkisi Verildi:** Alt kullanıcıya SMS API yetkisi tanımlandı  
✅ **IP Erişimi Verildi:** 46.224.248.228 (Coolify sunucusu) - 18.01.2026 22:59:46  
⏳ **Gönderici Adı Durumu:** "PETFENDY" onay durumu kontrol edilmeli  
⏳ **Kredi Durumu:** SMS kredisi kontrol edilmeli

## SMS Test API

### Test Endpoint
`POST /api/test-sms`

### Test Örnekleri

#### 1. Yeni Üye Bildirimleri Test Et (Kullanıcı + Admin)
```bash
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "05321234567",
    "type": "new-user",
    "name": "Ahmet Yılmaz"
  }'
```

#### 2. Rezervasyon Bildirimleri Test Et (Kullanıcı + Admin)
```bash
# Pet Otel
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "05321234567",
    "type": "new-booking",
    "name": "Ahmet Yılmaz"
  }'

# Pet Kreş
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "05321234567",
    "type": "new-booking-daycare",
    "name": "Ahmet Yılmaz"
  }'

# Pet Taksi
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "05321234567",
    "type": "new-booking-taxi",
    "name": "Ahmet Yılmaz"
  }'
```

#### 3. Sadece Rezervasyon Onay SMS'leri Test Et
```bash
# Pet Otel
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "05321234567",
    "type": "booking"
  }'

# Pet Kreş
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "05321234567",
    "type": "booking-daycare"
  }'

# Pet Taksi
curl -X POST http://localhost:3000/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "05321234567",
    "type": "booking-taxi"
  }'
```

## Petfendy SMS Kullanım Senaryoları

### 📱 Sadece 2 Durum İçin SMS Kullanılacak:

#### 1. 🆕 Yeni Üyelik
- **Kullanıcıya:** Hoş geldin mesajı (Ticari - İYS kontrollü)
- **Admin'e:** Yeni üye bildirimi (Bilgilendirme - İYS kontrolsüz)

#### 2. 📅 Rezervasyon Yapıldığında
- **Pet Otel:** "Bu tarihler arasında rezervasyonunuz yapıldı" (Ticari - İYS kontrollü)
- **Pet Kreş:** "Kreş kaydınız yapıldı" (Ticari - İYS kontrollü)  
- **Pet Taksi:** "Taksi rezervasyonunuz yapıldı" (Ticari - İYS kontrollü)
- **Admin'e:** Hizmet türüne göre özel bildirim mesajları (Bilgilendirme - İYS kontrolsüz)

### 🎯 Toplu Bildirim Fonksiyonları

```typescript
// Yeni üye - Hem kullanıcıya hem admin'e
await smsService.sendNewUserNotifications(
  'Ahmet Yılmaz',
  'ahmet@example.com', 
  '05321234567'
)

// Yeni rezervasyon - Hem kullanıcıya hem admin'e
await smsService.sendNewBookingNotifications(
  'hotel',
  'Ahmet Yılmaz',
  '05321234567',
  'Pet Otel - 25 Ocak 2026, Saat: 14:00'
)
```

## NetGSM Panel Kontrolleri

### ✅ Tamamlanan Ayarlar
1. **Alt Kullanıcı Hesabı:** bilge.corumlu@gmail.com oluşturuldu
2. **API Yetkisi:** Alt kullanıcıya SMS API yetkisi verildi
3. **IP Kısıtlaması:** 46.224.248.228 (Coolify sunucusu) erişim verildi

### ⏳ Kontrol Edilmesi Gerekenler
1. **Gönderici Adı:** "PETFENDY" onaylanmış mı?
2. **SMS Kredisi:** Yeterli bakiye var mı?
3. **Test Gönderimi:** İlk SMS testi yapıldı mı?

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