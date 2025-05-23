#!/usr/bin/env node

// Production database seeding script for Railway
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./src/lib/password');

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});

async function seedProduction() {
  console.log('🌱 Seeding production database...');
  
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists');
      return;
    }

    // Create test user
    console.log('👤 Creating test user...');
    const hashedPassword = await hashPassword('MySecure2024!Pass');
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
      }
    });

    console.log(`✅ Created test user: ${user.email}`);

    // Create sample subscriptions for demo
    console.log('📱 Creating sample subscriptions...');
    
    const subscriptions = [
      {
        serviceName: 'Netflix',
        planType: 'Premium',
        cost: 15.99,
        billingCycle: 'monthly',
        nextBillingDate: new Date('2025-06-15'),
        status: 'active',
        category: 'entertainment',
        paymentMethod: 'credit_card',
        autoRenewal: true,
      },
      {
        serviceName: 'Spotify',
        planType: 'Premium Individual',
        cost: 9.99,
        billingCycle: 'monthly',
        nextBillingDate: new Date('2025-06-08'),
        status: 'active',
        category: 'entertainment',
        paymentMethod: 'credit_card',
        autoRenewal: true,
      }
    ];

    for (const subscriptionData of subscriptions) {
      const subscription = await prisma.subscription.create({
        data: {
          ...subscriptionData,
          userId: user.id,
        }
      });
      console.log(`  ✅ Created subscription: ${subscription.serviceName}`);
    }

    console.log('\n🎯 Test Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: MySecure2024!Pass');
    
    console.log('\n🚀 Production seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedProduction()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = seedProduction;