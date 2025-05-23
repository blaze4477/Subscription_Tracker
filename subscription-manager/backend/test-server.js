// Minimal test server
const express = require('express');

console.log('🧪 Starting TEST server...');

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', test: true });
});

app.get('/ping', (req, res) => {
  console.log('Ping requested');
  res.send('pong');
});

console.log('About to start listening...');

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Test server running on http://127.0.0.1:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

console.log('Server setup complete');