const express = require('express');
const app = express();

// Simple test
app.get('/api/admin/pending', (req, res) => {
  res.json({ test: 'Route works!' });
});

app.listen(5000, () => {
  console.log('Test server on 5000');
  
  // Self-test
  const http = require('http');
  http.get('http://localhost:5000/api/admin/pending', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
      process.exit(0);
    });
  });
});
