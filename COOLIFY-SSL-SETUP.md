# 🔒 Coolify SSL Sertifikası Kurulumu

## Senaryo 1: Domain'in Var (petfendy.com)

### ADIM 1: Coolify'da Domain Ekle

1. **Coolify'a git**: http://46.224.248.228:8000
2. **Application sayfasına git** (petfendy uygulaması)
3. **"Domains"** sekmesine tıkla
4. **"+ Add Domain"** veya **"Add"** butonuna tıkla
5. Domain'i gir:
   ```
   petfendy.com
   ```
6. **"Add"** tıkla
7. İkinci domain ekle (www için):
   ```
   www.petfendy.com
   ```
8. **"Add"** tıkla

---

### ADIM 2: DNS Ayarlarını Yap

#### Domain Sağlayıcına Git (GoDaddy, Namecheap, vb.)

1. Domain yönetim paneline giriş yap
2. **DNS Management** veya **DNS Ayarları** bölümüne git
3. Şu kayıtları ekle:

**A Record 1:**
```
Type: A
Host: @
Points to: 46.224.248.228
TTL: 3600 (veya Auto)
```

**A Record 2:**
```
Type: A
Host: www
Points to: 46.224.248.228
TTL: 3600 (veya Auto)
```

4. **"Save"** veya **"Add Record"** tıkla

---

### ADIM 3: DNS Propagation Bekle

DNS değişikliklerinin yayılması 5-30 dakika sürebilir.

**Kontrol et:**
```powershell
nslookup petfendy.com
```

Çıktı şöyle olmalı:
```
Address: 46.224.248.228
```

---

### ADIM 4: Coolify'da SSL Oluştur

1. Coolify'a dön
2. Application → **"Domains"** sekmesi
3. Domain'in yanında **"Generate SSL"** veya **"Enable SSL"** butonu olmalı
4. Butona tıkla
5. Coolify otomatik olarak Let's Encrypt SSL sertifikası oluşturacak
6. 1-2 dakika bekle

**Başarılı olursa:**
- ✅ SSL Status: Active
- 🔒 HTTPS aktif
- Otomatik yenileme: 90 günde bir

---

### ADIM 5: HTTPS Test Et

1. Tarayıcıda aç: `https://petfendy.com`
2. Kilit simgesi görünmeli 🔒
3. Sertifika bilgilerini kontrol et:
   - Issuer: Let's Encrypt
   - Valid: 90 gün

---

## Senaryo 2: Domain Yok (Geçici Çözüm)

Eğer henüz domain almadıysan, Coolify'ın sağladığı subdomain kullanabilirsin:

### Coolify Subdomain ile SSL

1. Coolify'da Application → **"Domains"**
2. Otomatik oluşturulan subdomain'i kullan:
   ```
   vckgcw40o0wkcsswsc4okgkc.46.224.248.228.sslip.io
   ```
3. Bu subdomain zaten SSL ile geliyor (sslip.io)
4. Geçici olarak bu URL'i kullanabilirsin

---

## Senaryo 3: Cloudflare ile SSL (Önerilen - Ücretsiz)

Cloudflare kullanarak hem DNS hem SSL yönetimi yapabilirsin:

### ADIM 1: Cloudflare'e Domain Ekle

1. https://cloudflare.com → Sign up (ücretsiz)
2. **"Add a Site"** tıkla
3. Domain'i gir: `petfendy.com`
4. **Free Plan** seç
5. Cloudflare'in verdiği nameserver'ları kopyala

### ADIM 2: Nameserver Değiştir

1. Domain sağlayıcına git
2. **Nameservers** bölümünü bul
3. Cloudflare'in verdiği nameserver'ları gir:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
4. Save

### ADIM 3: Cloudflare'de DNS Ayarla

1. Cloudflare Dashboard → **DNS**
2. A record ekle:
   ```
   Type: A
   Name: @
   IPv4: 46.224.248.228
   Proxy: ON (turuncu bulut)
   ```
3. A record ekle:
   ```
   Type: A
   Name: www
   IPv4: 46.224.248.228
   Proxy: ON (turuncu bulut)
   ```

### ADIM 4: SSL Ayarları

1. Cloudflare → **SSL/TLS**
2. Encryption mode: **Full** seç
3. **Edge Certificates** → Always Use HTTPS: **ON**
4. Automatic HTTPS Rewrites: **ON**

### ADIM 5: Coolify'da Domain Ekle

1. Coolify → Application → Domains
2. Domain ekle: `petfendy.com`
3. SSL otomatik çalışacak (Cloudflare üzerinden)

---

## 🆘 Sorun Giderme

### "SSL Certificate Generation Failed"

**Sebep 1: DNS henüz yayılmadı**
- Çözüm: 30 dakika bekle, tekrar dene

**Sebep 2: Domain Coolify'a yönlendirilmemiş**
- Çözüm: DNS ayarlarını kontrol et
- Test: `nslookup petfendy.com`

**Sebep 3: Port 80/443 kapalı**
- Çözüm: Sunucu firewall ayarlarını kontrol et

### "Domain Not Accessible"

1. DNS propagation kontrol et: https://dnschecker.org
2. A record doğru mu kontrol et
3. Firewall kurallarını kontrol et

### "Mixed Content" Uyarısı

Sitede HTTP kaynaklar varsa:
1. Tüm URL'leri HTTPS yap
2. Veya relative URL kullan (`/images/logo.png`)

---

## 📋 Hızlı Kontrol Listesi

- [ ] Domain sahibiyim
- [ ] Domain sağlayıcı paneline erişimim var
- [ ] Coolify'da domain ekledim
- [ ] DNS A record ekledim (@ → 46.224.248.228)
- [ ] DNS A record ekledim (www → 46.224.248.228)
- [ ] DNS propagation tamamlandı (nslookup ile test)
- [ ] Coolify'da SSL oluşturdum
- [ ] HTTPS çalışıyor (https://petfendy.com)
- [ ] Tarayıcıda kilit simgesi görünüyor

---

## 💡 Öneriler

### Ücretsiz Domain Almak İçin:
- Freenom (ücretsiz .tk, .ml, .ga)
- Cloudflare (domain satın al + ücretsiz SSL)

### En İyi Yöntem:
1. ✅ Domain al (petfendy.com)
2. ✅ Cloudflare'e ekle (ücretsiz)
3. ✅ Cloudflare DNS kullan
4. ✅ Otomatik SSL + CDN + DDoS koruması

---

## 🎯 Sonraki Adımlar

SSL kurduktan sonra:

1. ✅ Environment variables'da URL'leri güncelle
2. ✅ HTTPS redirect aktif et
3. ✅ HSTS header ekle (güvenlik)
4. ✅ Sitemap'i güncelle
5. ✅ Google Search Console'a ekle

---

## 📞 Yardım

Hangi adımda takıldın? Bana söyle, yardımcı olayım! 🚀
