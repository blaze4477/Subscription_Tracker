const { execSync } = require('child_process');

console.log('🚂 Railway Deployment Starting...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`🌐 Port: ${process.env.PORT || 'not set'}`);
console.log(`💾 Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);

async function deployToRailway() {
  try {
    // Step 1: Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Step 2: Database setup - Use simple push for Railway
    if (process.env.DATABASE_URL) {
      console.log('🗄️  Setting up database schema...');
      try {
        // Try migrate deploy first
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Migrations applied successfully');
      } catch (migrateError) {
        console.log('📊 No migrations found, pushing schema...');
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
        console.log('✅ Schema pushed successfully');
      }
    } else {
      console.error('❌ DATABASE_URL not found!');
      process.exit(1);
    }

    // Step 3: Simple health check before starting
    console.log('🔍 Testing database connection...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database connection verified');
      await prisma.$disconnect();
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      console.warn('⚠️  Starting server anyway...');
    }

    // Step 4: Start the server
    console.log('🚀 Starting server...');
    require('./src/server.js');

  } catch (error) {
    console.error('❌ Railway deployment failed:', error.message);
    console.error('Environment check:');
    console.error('- PORT:', process.env.PORT);
    console.error('- NODE_ENV:', process.env.NODE_ENV);
    console.error('- DATABASE_URL present:', !!process.env.DATABASE_URL);
    console.error('- RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
    
    // Exit with error code
    process.exit(1);
  }
}

deployToRailway();