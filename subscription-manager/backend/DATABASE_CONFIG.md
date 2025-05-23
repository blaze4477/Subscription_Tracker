# Database Configuration & Railway Setup

This document explains the Prisma database configuration optimized for Railway PostgreSQL deployment with local SQLite development.

## ✅ Multi-Environment Database Support

### Local Development (SQLite)
- **Schema**: `prisma/schema.prisma` (SQLite provider)
- **Database**: `prisma/dev.db` file
- **URL**: `DATABASE_URL="file:./dev.db"`

### Production Railway (PostgreSQL)
- **Schema**: `prisma/schema.prod.prisma` (PostgreSQL provider)
- **Database**: Railway-managed PostgreSQL
- **URL**: Auto-provided by Railway PostgreSQL addon

## ✅ Enhanced Prisma Client Configuration

### Connection Management (`src/lib/database.js`)

#### Retry Logic
```javascript
prisma.$connect = async function connectWithRetry(retries = 3) {
  // Exponential backoff retry mechanism
  // Handles temporary connection failures
}
```

#### Railway Optimizations
```javascript
// PostgreSQL connection pool settings for Railway
if (isRailway && process.env.DATABASE_URL?.includes('postgresql')) {
  config.datasources = {
    db: { url: process.env.DATABASE_URL }
  };
  config.log = ['error', 'warn']; // Reduced logging for production
}
```

#### Error Handling
- Connection timeout handling
- Specific error code detection (P1001, P1008, P1017)
- Graceful degradation for connection failures
- Detailed logging for debugging

## ✅ Health Check Integration

### Database Health Monitoring
```javascript
async function getDatabaseHealth(prisma) {
  // Tests connection performance
  // Returns detailed health status
  // Measures response time
  // Detects environment (railway/local)
}
```

### Health Endpoint Response
```json
{
  "status": "healthy",
  "timestamp": "2025-05-23T14:16:43.329Z",
  "uptime": 4.355637632,
  "database": {
    "connected": true,
    "status": "healthy", 
    "response_time_ms": 2,
    "environment": "local"
  }
}
```

## ✅ Railway Deployment Process

### Automatic Schema Switching
```javascript
// In deploy.js
if (process.env.RAILWAY_ENVIRONMENT && process.env.DATABASE_URL?.includes('postgresql')) {
  // Copies schema.prod.prisma → schema.prisma
  execSync('cp prisma/schema.prod.prisma prisma/schema.prisma');
}
```

### Migration Strategy
1. **Existing Database**: `npx prisma migrate deploy`
2. **New Database**: `npx prisma db push` (fallback)
3. **Error Recovery**: Detailed logging and graceful failure

## ✅ Environment Variables

### Local Development (.env)
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
```

### Railway Production
```env
DATABASE_URL="postgresql://..."  # Auto-provided by Railway
NODE_ENV="production"
RAILWAY_ENVIRONMENT="production"
```

## ✅ Connection Pool Settings

### Railway PostgreSQL Optimizations
```javascript
// Server timeout settings
server.keepAliveTimeout = 120000;  // 2 minutes
server.headersTimeout = 120000;    // 2 minutes

if (process.env.RAILWAY_ENVIRONMENT) {
  server.setTimeout(300000);       // 5 minutes for Railway
}
```

### Connection Limits
- **Local SQLite**: 13 connections (Prisma default)
- **Railway PostgreSQL**: Managed by Railway connection pooling

## ✅ Error Recovery Patterns

### Connection Failures
```javascript
// Graceful degradation
if (!dbConnected) {
  console.warn('⚠️  Continuing without database connection');
  // Server starts anyway for health checks
}
```

### Specific Error Handling
- **P1001**: Connection refused → Check database server
- **P1008**: Connection timeout → Check network
- **P1017**: Authentication failed → Check credentials
- **ENOTFOUND**: DNS resolution failed → Check host

## ✅ Migration Management

### Local Development
```bash
# Create new migration
npx prisma migrate dev --name feature_name

# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate
```

### Railway Production
```bash
# Deploy migrations (automatic in deploy.js)
npx prisma migrate deploy

# Push schema (fallback for new databases)
npx prisma db push
```

## ✅ Database Seeding

### Development Seeding
```bash
# Run seed script
npx prisma db seed

# Custom seed for Railway
NODE_ENV=production npx prisma db seed
```

### Seed Configuration (package.json)
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

## ✅ Monitoring & Debugging

### Database Logging
```javascript
// Development: Full logging
log: ['query', 'info', 'warn', 'error']

// Production: Error only
log: ['error', 'warn']
```

### Health Monitoring
- Response time tracking
- Connection status monitoring
- Environment detection
- Error categorization

## ✅ Best Practices

### Connection Management
1. Always use connection pooling
2. Implement retry logic with exponential backoff
3. Handle connection failures gracefully
4. Monitor connection health continuously

### Schema Management
1. Separate schemas for development/production
2. Automatic schema switching in deployment
3. Version control all migration files
4. Test migrations in staging environment

### Error Handling
1. Specific error code handling
2. Detailed logging for debugging
3. Graceful degradation strategies
4. User-friendly error messages

## 🚀 Railway Deployment Checklist

- ✅ PostgreSQL addon added to Railway project
- ✅ `DATABASE_URL` automatically provided by Railway
- ✅ Production schema configured (`schema.prod.prisma`)
- ✅ Deployment script handles schema switching
- ✅ Migration strategy implemented
- ✅ Health checks configured
- ✅ Error handling implemented
- ✅ Connection pooling optimized
- ✅ Logging configured for production

Your database is now fully configured for Railway deployment! 🎉