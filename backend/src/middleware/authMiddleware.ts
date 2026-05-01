import { verifyToken } from '../utils/jwt';
import User from '../models/User';

export const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token) as any;
    req.user = await User.findById(decoded.id).select('-otp');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.message === 'jwt malformed') {
      console.warn('Invalid token attempt');
    } else if (error.name === 'TokenExpiredError') {
      console.warn('Expired token attempt');
    } else {
      console.error('Auth error:', error);
    }
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
