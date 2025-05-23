const { PrismaClient } = require('@prisma/client');

// Database configuration based on environment
function getDatabaseConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
  
  // Base configuration
  const config = {
    log: isProduction ? ['error'] : ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty',
  };

  // Railway PostgreSQL optimizations
  if (isRailway && process.env.DATABASE_URL?.includes('postgresql')) {
    config.datasources = {
      db: {
        url: process.env.DATABASE_URL,
      },
    };
    
    // PostgreSQL connection pool settings for Railway
    config.datasourceUrl = process.env.DATABASE_URL;
    config.log = ['error', 'warn']; // Reduce logging in production
  }

  return config;
}

// Create Prisma client with enhanced error handling
function createPrismaClient() {
  const config = getDatabaseConfig();
  
  const prisma = new PrismaClient(config);

  // Add connection event handlers
  prisma.$on('error', (e) => {
    console.error('Prisma error event:', {
      message: e.message,
      target: e.target,
      timestamp: new Date().toISOString(),
    });
  });

  // Custom connection wrapper with retry logic
  const originalConnect = prisma.$connect.bind(prisma);
  prisma.$connect = async function connectWithRetry(retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await originalConnect();
        console.log(`✅ Database connected successfully (attempt ${attempt})`);
        return;
      } catch (error) {
        console.error(`❌ Database connection failed (attempt ${attempt}):`, error.message);
        
        if (attempt === retries) {
          throw new Error(`Failed to connect to database after ${retries} attempts: ${error.message}`);
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  return prisma;
}

// Test database connection with detailed error reporting
async function testDatabaseConnection(prisma) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connectivity
    await prisma.$connect();
    
    // Test query execution
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Railway-specific connection info
    if (process.env.RAILWAY_ENVIRONMENT) {
      console.log('🚂 Railway PostgreSQL connection verified');
      
      // Test PostgreSQL-specific query
      try {
        const versionResult = await prisma.$queryRaw`SELECT version() as version`;
        console.log('📊 PostgreSQL version check passed');
      } catch (versionError) {
        console.warn('⚠️  PostgreSQL version check failed:', versionError.message);
      }
    } else {
      console.log('💾 Local SQLite connection verified');
    }
    
    return {
      connected: true,
      result,
      message: 'Database connection successful'
    };
    
  } catch (error) {
    console.error('❌ Database connection test failed:', {
      error: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Provide specific error guidance
    if (error.code === 'P1001') {
      console.error('🔥 Connection refused - check if database server is running');
    } else if (error.code === 'P1008') {
      console.error('⏰ Connection timeout - check network connectivity');
    } else if (error.code === 'P1017') {
      console.error('🔐 Authentication failed - check database credentials');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 DNS resolution failed - check database host');
    }
    
    return {
      connected: false,
      error: error.message,
      code: error.code,
      message: 'Database connection failed'
    };
  }
}

// Graceful database disconnect
async function disconnectDatabase(prisma) {
  try {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error.message);
    throw error;
  }
}

// Database health check for monitoring
async function getDatabaseHealth(prisma) {
  const startTime = Date.now();
  
  try {
    // Test connection and query performance
    await prisma.$queryRaw`SELECT 1 as health_check`;
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      connected: true,
      responseTime,
      timestamp: new Date().toISOString(),
      environment: process.env.RAILWAY_ENVIRONMENT ? 'railway' : 'local'
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message,
      responseTime,
      timestamp: new Date().toISOString(),
      environment: process.env.RAILWAY_ENVIRONMENT ? 'railway' : 'local'
    };
  }
}

module.exports = {
  createPrismaClient,
  testDatabaseConnection,
  disconnectDatabase,
  getDatabaseHealth,
  getDatabaseConfig
};