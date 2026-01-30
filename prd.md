# 🐾 Petfendy.com — Ürün Gereksinimleri Dokümanı (PRD)

**Ürün Adı:** Petfendy  
**Versiyon:** 1.0  
**Hazırlayan:** Kıdemli Ürün Yöneticisi – Çetin Kaya  
**Tarih:** 24.10.2025  
**Durum:** Taslak (Draft)

---

## 1. ÜRÜN VİZYONU
Evcil hayvan sahiplerinin güvenle kedi ve köpeklerini emanet edebileceği, online rezervasyon ve ödeme sistemine sahip **Pet Otel ve Hayvan Taksi** platformu oluşturmak.  
Petfendy, evcil dostlar için konforlu konaklama ve güvenli ulaşım hizmetlerini tek platformda sunarak kullanıcı dostu bir deneyim sağlar.

---

## 2. HEDEF KULLANICILAR
- Evcil hayvan sahibi bireyler  
- Pet otel işletmeleri  
- Hayvan taşıma sürücüleri  
- Admin & Operasyon ekibi

---

## 3. ANA ÖZELLİKLER

### 3.1. Rezervasyon Tipi 1 — Pet Otel Konaklama

#### Kullanıcı
- Tarih aralığı seçimi (giriş/çıkış)  
- Oda müsaitlik kontrolü  
- Dinamik fiyat hesaplama  
- Sepete ekleme, ödeme, fatura maili  
- Üye veya misafir satın alma desteği  

#### Yönetici
- Oda yönetimi (ekleme, silme, fiyat)  
- Gün bazlı fiyatlama  
- Rezervasyon ve gelir raporları  
- Sanal POS yönetimi  

---

### 3.2. Rezervasyon Tipi 2 — Hayvan Taksi Hizmeti

#### Kullanıcı
- Tarih, bulunduğu il, gideceği il seçimi  
- Gidiş-dönüş kilometre otomatik hesaplama  
- Yönetim panelinde tanımlı “km başı fiyat” üzerinden fiyatlandırma  
- Sepete ekleme, ödeme, fatura e-postası  

#### Yönetici
- Kilometre başı fiyat tanımlama  
- Şehir bazlı ek ücret / promosyon tanımı  
- Sipariş ve sürücü yönetimi  
- SMS ve e-posta bildirimleri  

---

## 4. GENEL SİSTEM ÖZELLİKLERİ

| Özellik | Açıklama |
|----------|-----------|
| Ödeme Entegrasyonu | İyzico / PayTR API |
| Fatura & E-Posta | PDF fatura + mail gönderimi |
| Üyelik Sistemi | Kayıt / misafir satın alma |
| Yönetim Paneli | Oda, sipariş, fiyat, kullanıcı yönetimi |
| Güvenlik | SSL, JWT, PCI-DSS uyumlu |
| Raporlama | Dashboard, gelir grafikleri |

---

## 5. TEKNİK MİMARİ

| Katman | Teknoloji |
|--------|------------|
| Frontend | Next.js + Tailwind CSS |
| Backend | Node.js (Express) veya .NET Core |
| Database | PostgreSQL |
| ORM | Prisma veya Entity Framework |
| Auth | JWT + OAuth2 |
| Hosting | Vercel / AWS |
| Loglama | Winston / Graylog |
| E-posta | SendGrid / SES |

---

## 6. KULLANICI AKIŞI

1. Kullanıcı ana sayfadan rezervasyon türü seçer  
2. Gerekli bilgileri doldurur  
3. Sistem fiyatı otomatik hesaplar  
4. Kullanıcı sepete ekler → ödeme yapar  
5. Sistem onay maili + fatura gönderir  
6. Yönetici panelde işlemi izler  

---

## 7. KABUL KRİTERLERİ

| No | Gereksinim | Kabul Kriteri |
|----|-------------|----------------|
| 1 | Tarih aralığı fiyatı | Doğru hesaplanmalı |
| 2 | Km fiyatı | Gidiş-dönüş doğru çarpılmalı |
| 3 | Misafir satın alma | Hesapsız ödeme tamamlanmalı |
| 4 | Fatura gönderimi | PDF e-posta ile iletilmeli |
| 5 | Yönetim paneli | CRUD işlemleri yapılmalı |
| 6 | Sanal POS | Başarılı ödeme testleri yapılmalı |

---

## 8. ROADMAP

| Sürüm | Özellik | Durum |
|-------|----------|-------|
| v1.0 | Otel & Taksi rezervasyon | Devam ediyor |
| v1.1 | Admin panel & fatura | Planlama |
| v1.2 | Kullanıcı geçmişi | Planlama |
| v2.0 | AI fiyat önerisi & mobil app | Gelecek |

---

## 9. RİSKLER & ÖNERİLER
- **Riski:** Mesafe hesap hatası  
  **Çözüm:** Google Maps Distance API  
- **Riski:** E-posta başarısızlığı  
  **Çözüm:** SendGrid SMTP fallback  
- **Riski:** Sanal POS hatası  
  **Çözüm:** Sandbox test ortamı  

---
