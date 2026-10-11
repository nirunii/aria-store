// Guards for routes. requireAuth = must be logged in. requireAdmin = must be an admin.
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in first' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, is_admin }
    next();
  } catch {
    res.status(401).json({ error: 'Your session expired. Please log in again' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user.is_admin) return res.status(403).json({ error: 'Admins only' });
    next();
  });
}

module.exports = { requireAuth, requireAdmin };
