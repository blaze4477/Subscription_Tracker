#!/usr/bin/env node

// Simple health check test script
const http = require('http');
const https = require('https');

// URLs to test  
const LOCALHOST = 'http://localhost:3001/health';
const PRODUCTION = process.argv[2] || null; // Pass production URL as argument

function testEndpoint(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;
    
    const req = client.get(url, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log('🏥 Testing Health Endpoints...\n');
  
  // Test localhost
  const localhostResult = await testEndpoint(LOCALHOST);
  console.log(`Localhost (${LOCALHOST}): ${localhostResult ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test production if provided
  if (PRODUCTION) {
    const productionResult = await testEndpoint(PRODUCTION);
    console.log(`Production (${PRODUCTION}): ${productionResult ? '✅ PASS' : '❌ FAIL'}`);
    
    process.exit(localhostResult && productionResult ? 0 : 1);
  } else {
    console.log('\n💡 To test production: npm run test:health:simple https://your-app.railway.app/health');
    process.exit(localhostResult ? 0 : 1);
  }
}

main();