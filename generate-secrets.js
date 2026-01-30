// Coolify Environment Variables için Secret Generator
// Kullanım: node generate-secrets.js

const crypto = require('crypto');

console.log('='.repeat(60));
console.log('PETFENDY - COOLIFY ENVIRONMENT SECRETS');
console.log('='.repeat(60));
console.log('');

console.log('📋 Aşağıdaki değerleri kopyala ve Coolify\'a yapıştır:');
console.log('');

console.log('1️⃣  JWT_SECRET:');
console.log(crypto.randomBytes(64).toString('base64'));
console.log('');

console.log('2️⃣  JWT_REFRESH_SECRET:');
console.log(crypto.randomBytes(64).toString('base64'));
console.log('');

console.log('3️⃣  ENCRYPTION_KEY:');
console.log(crypto.randomBytes(32).toString('base64'));
console.log('');

console.log('4️⃣  IYZICO_WEBHOOK_SECRET (opsiyonel):');
console.log(crypto.randomBytes(32).toString('hex'));
console.log('');

console.log('='.repeat(60));
console.log('✅ Secret\'lar oluşturuldu!');
console.log('💡 Her çalıştırmada farklı değerler üretilir.');
console.log('⚠️  Bu değerleri güvenli bir yerde sakla!');
console.log('='.repeat(60));
