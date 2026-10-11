// Loads server/.env when it exists (your computer). On a hosting service there is no .env file;
// the settings are typed into the host's dashboard instead, and arrive as normal environment variables.
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else if (!process.env.JWT_SECRET) {
  console.error('\nMissing file: ' + envPath);
  console.error('Fix: copy server/.env.example to server/.env, put your PostgreSQL password in DB_PASSWORD, save, and try again.\n');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('\nJWT_SECRET is missing. Add a line like: JWT_SECRET=any-long-random-text\n');
  process.exit(1);
}
