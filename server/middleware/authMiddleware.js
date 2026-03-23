import jwt from 'jsonwebtoken';

/**
 * Verifies JWT from Authorization: Bearer <token> and attaches user id to req.userId
 */
export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (!decoded.sub) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }
    req.userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
