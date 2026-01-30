#!/bin/bash
# Coolify Environment Variables Setup Script
# Bu script'i çalıştırarak güvenli secret'lar oluşturabilirsin

echo "=== Petfendy Coolify Environment Variables ==="
echo ""
echo "1. JWT_SECRET:"
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
echo ""
echo "2. JWT_REFRESH_SECRET:"
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
echo ""
echo "3. ENCRYPTION_KEY:"
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
echo ""
echo "4. IYZICO_WEBHOOK_SECRET:"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo ""
echo "Bu değerleri Coolify'da Environment Variables'a ekle!"
