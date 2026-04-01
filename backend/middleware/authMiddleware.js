import jwt from 'jsonwebtoken';
import { getJwtSecret, getTokenFromRequest } from '../utils/auth.js';

export const authenticate = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (err) {
    const status = err.message.includes('JWT_SECRET') ? 500 : 401;
    res.status(status).json({ message: status === 500 ? 'Authentication is not configured correctly.' : 'Invalid Token' });
  }
};

export const optionalAuth = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return next();
  try {
    req.user = jwt.verify(token, getJwtSecret());
  } catch (err) {}
  next();
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
