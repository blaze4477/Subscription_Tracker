// Ultra-simple health server for Railway debugging
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Ultra-simple health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.RAILWAY_ENVIRONMENT ? 'railway' : 'local',
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Subscription Manager API - Health Server',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 Health server running on http://0.0.0.0:${PORT}`);
  console.log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
});