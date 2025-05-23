// Emergency Railway startup script
const express = require('express');

console.log('🚨 Emergency Railway startup...');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3000;

// Minimal health check
app.get('/health', (req, res) => {
  console.log('Health check hit');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Server is running', health: '/health' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on 0.0.0.0:${PORT}`);
  console.log(`🔍 Health: http://0.0.0.0:${PORT}/health`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

setTimeout(() => {
  console.log('Server has been running for 30 seconds');
}, 30000);