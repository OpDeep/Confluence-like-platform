import jwt from 'jsonwebtoken';
import db from '../database/init.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Get user details from database
    const stmt = db.prepare('SELECT id, email, name, avatar FROM users WHERE id = ?');
    const userData = stmt.get(user.userId);

    if (!userData) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = userData;
    next();
  });
};