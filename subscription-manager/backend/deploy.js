const { execSync } = require('child_process');

console.log('🚀 Starting Subscription Manager Backend...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`🌐 Port: ${process.env.PORT || 3001}`);
console.log(`🌐 Host: ${process.env.HOST || '0.0.0.0'}`);
console.log(`💾 Database URL: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);

// Check if running in Railway
if (process.env.RAILWAY_ENVIRONMENT) {
  console.log(`🚂 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
  console.log(`🚂 Railway Service: ${process.env.RAILWAY_SERVICE_NAME || 'unknown'}`);
}

async function deploy() {
  try {
    // Railway-specific database setup
    if (process.env.RAILWAY_ENVIRONMENT && process.env.DATABASE_URL?.includes('postgresql')) {
      console.log('🚂 Railway PostgreSQL detected - switching to production schema...');
      
      // Copy production schema for Railway
      execSync('cp prisma/schema.prod.prisma prisma/schema.prisma', { stdio: 'inherit' });
      console.log('✅ Production schema activated');
    }

    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Database setup based on environment
    if (process.env.RAILWAY_ENVIRONMENT) {
      console.log('🗄️  Running Railway database migrations...');
      try {
        // Try migrate deploy first (for existing databases)
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      } catch (migrateError) {
        console.log('📊 No existing migrations found, creating database...');
        try {
          // If no migrations exist, push schema directly
          execSync('npx prisma db push', { stdio: 'inherit' });
        } catch (pushError) {
          console.error('❌ Database setup failed:', pushError.message);
          throw pushError;
        }
      }
    } else {
      console.log('🗄️  Running local database migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }

    // Start the server
    console.log('✅ Starting server...');
    require('./src/server.js');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Environment check:');
    console.error('- PORT:', process.env.PORT);
    console.error('- NODE_ENV:', process.env.NODE_ENV);
    console.error('- DATABASE_URL present:', !!process.env.DATABASE_URL);
    console.error('- RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
    console.error('- Database type:', process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite');
    process.exit(1);
  }
}

deploy();