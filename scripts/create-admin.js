// Create Admin User Script
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔄 Creating admin user...');
    
    // Hash password: ErikUzum52707+.
    const passwordHash = await bcrypt.hash('ErikUzum52707+.', 12);
    
    // Create or update admin user
    const user = await prisma.user.upsert({
      where: { email: 'petfendyotel@gmail.com' },
      update: {
        passwordHash: passwordHash,
        role: 'ADMIN',
        emailVerified: true,
        active: true
      },
      create: {
        email: 'petfendyotel@gmail.com',
        name: 'Admin User',
        phone: '+905551234567',
        passwordHash: passwordHash,
        role: 'ADMIN',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        active: true
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🔑 Role:', user.role);
    console.log('');
    console.log('Login credentials:');
    console.log('Email: petfendyotel@gmail.com');
    console.log('Password: ErikUzum52707+.');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
