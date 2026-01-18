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

## SMS Türleri ve İYS Uyumluluğu

### 🔴 Ticari SMS'ler (İYS Kontrollü - iysfilter=11)
Bu SMS'ler müşterilere gönderilir ve İYS'de kayıtlı olmayan numaralara gönderilmez:

1. **Hoş Geldin Mesajı** - Yeni üyelik (Ticari içerik)
2. **Rezervasyon Onayı** - Pet otel/taksi rezervasyonu (Ticari içerik)
3. **Ödeme Bildirimleri** - Başarılı/başarısız ödeme (Ticari içerik)
4. **Hatırlatma** - Rezervasyon hatırlatması (Ticari içerik)
5. **İptal/İade** - Rezervasyon iptali ve iade bildirimleri (Ticari içerik)

### 🟢 Bilgilendirme SMS'leri (İYS Kontrolsüz - iysfilter=0)
Bu SMS'ler güvenlik/bilgilendirme amaçlı olup İYS kontrolü yapılmaz:

1. **Doğrulama Kodu** - Telefon doğrulama (Güvenlik)
2. **İşletme Bildirimleri** - İşletme sahibine gönderilen bildirimler

### ⚠️ İYS Uyarısı
- Müşterilere gönderilen ticari SMS'ler İYS'de kayıtlı olmayan numaralara GÖNDERİLMEZ
- Müşterilerinizin İYS'de "Petfendy" markası için izin vermiş olması gerekir
- İYS kaydı olmayan müşteriler SMS alamayacaktır

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