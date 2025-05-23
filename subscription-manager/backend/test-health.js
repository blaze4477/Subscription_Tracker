#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Configuration
const LOCALHOST_URL = 'http://localhost:3001/health';
const PRODUCTION_URL = 'https://your-backend.railway.app/health'; // Replace with your Railway URL
const TIMEOUT = 10000; // 10 seconds

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const startTime = Date.now();
    
    const req = client.get(url, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            responseTime,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            responseTime,
            data: data,
            parseError: error.message,
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject({
        error: error.message,
        code: error.code
      });
    });
    
    req.setTimeout(TIMEOUT, () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        timeout: TIMEOUT
      });
    });
  });
}

function formatResponse(response) {
  if (response.data && typeof response.data === 'object') {
    return JSON.stringify(response.data, null, 2);
  }
  return response.data;
}

async function testHealthEndpoint(url, name) {
  log(`\n${colors.bold}Testing ${name}:${colors.reset}`);
  log(`URL: ${colors.blue}${url}${colors.reset}`);
  
  try {
    const response = await makeRequest(url);
    
    // Check if status is 200
    const isHealthy = response.statusCode === 200;
    const statusColor = isHealthy ? colors.green : colors.red;
    const statusIcon = isHealthy ? '✅' : '❌';
    
    log(`${statusIcon} Status: ${statusColor}${response.statusCode}${colors.reset}`);
    log(`⏱️  Response Time: ${colors.yellow}${response.responseTime}ms${colors.reset}`);
    
    if (response.data) {
      log(`📄 Response Data:`);
      log(`${colors.blue}${formatResponse(response)}${colors.reset}`);
      
      // Additional checks for health endpoint structure
      if (typeof response.data === 'object') {
        const hasStatus = 'status' in response.data;
        const hasTimestamp = 'timestamp' in response.data;
        const hasUptime = 'uptime' in response.data;
        
        log(`\n🔍 Health Check Structure:`);
        log(`   Status field: ${hasStatus ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
        log(`   Timestamp field: ${hasTimestamp ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
        log(`   Uptime field: ${hasUptime ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
        
        if (response.data.database) {
          const dbStatus = response.data.database.connected ? 
            colors.green + '✓ Connected' : 
            colors.red + '✗ Disconnected';
          log(`   Database: ${dbStatus}${colors.reset}`);
        }
      }
    }
    
    if (response.parseError) {
      log(`⚠️  JSON Parse Error: ${colors.red}${response.parseError}${colors.reset}`);
    }
    
    return {
      success: isHealthy,
      statusCode: response.statusCode,
      responseTime: response.responseTime,
      url: url
    };
    
  } catch (error) {
    log(`❌ Error: ${colors.red}${error.error}${colors.reset}`);
    if (error.code) {
      log(`   Error Code: ${colors.red}${error.code}${colors.reset}`);
    }
    if (error.timeout) {
      log(`   Timeout: ${colors.yellow}${error.timeout}ms${colors.reset}`);
    }
    
    return {
      success: false,
      error: error.error,
      code: error.code,
      url: url
    };
  }
}

async function main() {
  log(`${colors.bold}${colors.blue}🏥 Health Endpoint Test Script${colors.reset}`);
  log(`${colors.blue}================================${colors.reset}`);
  
  const results = [];
  
  // Test localhost
  const localhostResult = await testHealthEndpoint(LOCALHOST_URL, 'Localhost');
  results.push(localhostResult);
  
  // Test production (only if URL is not the placeholder)
  if (!PRODUCTION_URL.includes('your-backend.railway.app')) {
    const productionResult = await testHealthEndpoint(PRODUCTION_URL, 'Production');
    results.push(productionResult);
  } else {
    log(`\n${colors.yellow}⚠️  Skipping production test - Please update PRODUCTION_URL in the script${colors.reset}`);
    log(`   Replace 'your-backend.railway.app' with your actual Railway URL`);
  }
  
  // Summary
  log(`\n${colors.bold}📊 Test Summary:${colors.reset}`);
  log(`${colors.blue}=================${colors.reset}`);
  
  let allPassed = true;
  
  results.forEach((result, index) => {
    const testName = index === 0 ? 'Localhost' : 'Production';
    if (result.success) {
      log(`${colors.green}✅ ${testName}: PASSED (${result.statusCode}, ${result.responseTime}ms)${colors.reset}`);
    } else {
      log(`${colors.red}❌ ${testName}: FAILED${colors.reset}`);
      if (result.statusCode) {
        log(`   Status: ${result.statusCode}`);
      }
      if (result.error) {
        log(`   Error: ${result.error}`);
      }
      allPassed = false;
    }
  });
  
  log(`\n${colors.bold}Overall Result: ${allPassed ? colors.green + '✅ ALL TESTS PASSED' : colors.red + '❌ SOME TESTS FAILED'}${colors.reset}`);
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  log(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  process.exit(1);
});

// Run the tests
main().catch((error) => {
  log(`${colors.red}Script error: ${error.message}${colors.reset}`);
  process.exit(1);
});