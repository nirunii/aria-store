// Run once with "npm run setup-db": creates the database (if missing), tables, sample dresses and the first admin.
require('./config'); // loads .env first, with a friendly message if it is missing
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const pool = require('./db');
const explain = require('./explain');

const categories = ['Evening', 'Day', 'Wedding guest', 'Resort'];
const sample = [
  ['Satin Slip Dress', 'Bias-cut satin that moves with you. Fully lined.', 89, 'evening', 20],
  ['Wrap Midi Dress', 'A flattering wrap with an adjustable tie waist.', 74, 'day', 25],
  ['Pleated Maxi Dress', 'Floor-length pleats in a lightweight, flowing fabric.', 96, 'wedding-guest', 15],
  ['Linen Shirt Dress', 'Breathable linen with a relaxed, belted shape.', 68, 'resort', 30],
  ['Velvet Cocktail Dress', 'Soft velvet with a square neckline.', 110, 'evening', 10],
  ['Floral Tea Dress', 'A romantic tea-length dress with puffed sleeves.', 79, 'day', 18],
];

async function ensureDatabase() {
  const s = pool.settings;
  if (!/^[A-Za-z0-9_]+$/.test(s.database)) throw new Error('DB_NAME may only contain letters, numbers and underscores.');
  const admin = new Client({ ...s, database: 'postgres' });
  await admin.connect();
  const found = await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', [s.database]);
  if (!found.rowCount) {
    await admin.query(`CREATE DATABASE "${s.database}"`);
    console.log(`Created database "${s.database}".`);
  }
  await admin.end();
}

(async () => {
  try {
    if (!pool.settings.hosted) await ensureDatabase(); // hosted databases already exist
    await pool.query(fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8'));
    for (const c of categories)
      await pool.query('INSERT INTO categories(name,slug) VALUES($1,$2) ON CONFLICT DO NOTHING',
        [c, c.toLowerCase().replace(/\s+/g, '-')]);

    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM products');
    if (rows[0].n === 0)
      for (const [name, desc, price, slug, stock] of sample)
        await pool.query(
          `INSERT INTO products(name,description,price,stock,category_id)
           VALUES($1,$2,$3,$4,(SELECT id FROM categories WHERE slug=$5))`, [name, desc, price, stock, slug]);

    const email = (process.env.ADMIN_EMAIL || 'admin@aria.test').toLowerCase();
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin12345', 10);
    await pool.query(
      `INSERT INTO users(name,email,password_hash,is_admin) VALUES('Admin',$1,$2,TRUE) ON CONFLICT (email) DO NOTHING`,
      [email, hash]);
    console.log('\nDatabase ready.');
    console.log('Admin login: ' + email + ' / ' + (process.env.ADMIN_PASSWORD || 'admin12345'));
  } catch (e) {
    console.error('\nSetup failed: ' + explain(e, pool.settings) + '\n');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
