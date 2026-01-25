# 🔑 GitHub Deploy Key Ekleme

## Public Key (Coolify'dan)

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP5wWKx0n1FLS1QtCQDhinWZDTS6IZ/wizaqJLWAEDUn
```

---

## 📝 GitHub'a Ekleme Adımları

### 1️⃣ GitHub'a Git
```
https://github.com/petfendyotel-byte/petfendy/settings/keys
```

### 2️⃣ "Add deploy key" Butonuna Tıkla

### 3️⃣ Formu Doldur

**Title:** (Kopyala-yapıştır)
```
Coolify Deployment Server
```

**Key:** (Kopyala-yapıştır)
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP5wWKx0n1FLS1QtCQDhinWZDTS6IZ/wizaqJLWAEDUn
```

**Allow write access:** 
```
❌ İŞARETLEME (Coolify sadece okuma yapacak)
```

### 4️⃣ "Add key" Butonuna Tıkla

---

## ✅ Deploy Key Eklendikten Sonra

1. Coolify'a dön: http://46.224.248.228:8000
2. Application sayfasına git
3. **"Deploy"** butonuna tıkla
4. Logs'u izle

---

## 🎉 Başarılı!

Deploy key eklendikten sonra Coolify GitHub'dan kod çekebilecek ve deployment başlayacak.

Build süreci:
- ⏳ Cloning repository...
- ⏳ Installing dependencies...
- ⏳ Building Next.js...
- ⏳ Creating Docker image...
- ✅ Deployment successful!

**Süre:** 5-10 dakika

---

## 🆘 Sorun mu var?

### "Permission denied (publickey)" Hatası
- Deploy key'i doğru ekledin mi kontrol et
- Public key'i tam kopyaladın mı kontrol et

### "Repository not found" Hatası
- Repository URL doğru mu: `git@github.com:petfendyotel-byte/petfendy.git`
- Deploy key eklendi mi kontrol et

---

## 📞 Yardım

Deploy key ekledikten sonra bana haber ver, devam edelim!
