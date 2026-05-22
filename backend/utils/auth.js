const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'denthive-local-secret';

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      active: user.active,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function requireAuth(roles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (payload.active === false) return res.status(401).json({ error: 'User inactive' });
      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.auth = payload;
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

module.exports = { signToken, requireAuth };

