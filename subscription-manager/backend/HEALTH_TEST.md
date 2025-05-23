# Health Endpoint Testing

This directory contains test scripts to verify your health endpoint is working correctly.

## Scripts Available

### 1. Detailed Health Test
```bash
npm run test:health
```
- Tests localhost and production URLs
- Shows detailed response data
- Validates response structure
- Includes database connectivity status
- Color-coded output with timing information

### 2. Simple Health Test  
```bash
npm run test:health:simple
```
- Quick pass/fail test for localhost
- Minimal output for CI/CD pipelines

```bash
npm run test:health:simple https://your-app.railway.app/health
```
- Test both localhost and production URL

## Manual Testing

### Test Localhost
```bash
curl -s http://localhost:3001/health
```

### Test Production
```bash
curl -s https://your-app.railway.app/health
```

## Expected Response

### Healthy Status (200)
```json
{
  "status": "healthy",
  "timestamp": "2025-05-23T14:09:19.617Z",
  "uptime": 4.234757709,
  "database": {
    "connected": true,
    "status": "connected", 
    "response_time_ms": 5
  }
}
```

### Degraded Status (503)
```json
{
  "status": "degraded",
  "timestamp": "2025-05-23T14:09:19.617Z",
  "uptime": 4.234757709,
  "database": {
    "connected": false,
    "status": "disconnected",
    "error": "Connection failed"
  }
}
```

## Status Meanings

- **`healthy`** (HTTP 200) - All systems operational, database connected
- **`degraded`** (HTTP 503) - App running but database issues or not configured  
- **`unhealthy`** (HTTP 503) - Critical failures (would prevent server startup)

## CI/CD Integration

Use the simple test in your deployment pipeline:

```yaml
# GitHub Actions example
- name: Health Check
  run: |
    npm run test:health:simple https://your-app.railway.app/health
```

```bash
# Railway deployment hook
npm run test:health:simple $RAILWAY_PUBLIC_DOMAIN/health
```

## Files

- `test-health.js` - Detailed testing with full output
- `test-health-simple.js` - Quick pass/fail testing
- `HEALTH_TEST.md` - This documentation

## Configuration

To test your production deployment:

1. **Update production URL** in `test-health.js`:
   ```javascript
   const PRODUCTION_URL = 'https://your-actual-railway-url.railway.app/health';
   ```

2. **Or use command line** with simple test:
   ```bash
   npm run test:health:simple https://your-actual-railway-url.railway.app/health
   ```