// Entry point: creates the web server and plugs in the routes.
require('./config');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
const explain = require('./explain');

const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir)); // makes uploaded pictures viewable in the browser

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`API running on http://localhost:${PORT}`);
  try {
    await pool.query('SELECT 1');
    console.log('Database connected.');
  } catch (e) {
    console.error('\nDATABASE PROBLEM: ' + explain(e, pool.settings) + '\n');
  }
});
