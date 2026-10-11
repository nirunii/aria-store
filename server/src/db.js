// One shared connection pool to PostgreSQL, reused by every route.
// Local: uses DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME.
// Hosted: if DATABASE_URL is set (given by Neon, Supabase, Render...), that is used instead, with SSL.
require('./config');
const { Pool } = require('pg');

const hosted = Boolean(process.env.DATABASE_URL);
const local = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD ?? ''), // always a string, so special characters like @ are fine
  database: process.env.DB_NAME || 'aria_store',
};

const pool = new Pool(hosted ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } } : local);
pool.settings = hosted ? { hosted: true, host: 'the hosted database', port: '', database: 'hosted' } : local;
module.exports = pool;
