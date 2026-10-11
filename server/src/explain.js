// Turns confusing database errors into plain advice.
module.exports = function explain(e, s) {
  if (e.code === '28P01' || /password/i.test(e.message))
    return 'PostgreSQL rejected the password. Check DB_PASSWORD in server/.env. Type it exactly as you set it when installing PostgreSQL (no quotes, unless it contains a # character).';
  if (e.code === 'ECONNREFUSED' || e.code === 'ETIMEDOUT')
    return `Cannot reach PostgreSQL at ${s.host}:${s.port}. Make sure the PostgreSQL service is running (Windows: Start menu > Services > postgresql).`;
  if (e.code === '3D000') return `Database "${s.database}" does not exist. Run: npm run setup-db`;
  return e.message;
};
