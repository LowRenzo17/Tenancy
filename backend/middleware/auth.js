import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ success: false, message: 'Server misconfiguration: JWT_SECRET is missing' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -twoFactorSecret -backupCodes -resetPasswordToken -resetPasswordExpires');

      if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      const message = error.name === 'TokenExpiredError'
        ? 'Token expired'
        : 'Invalid or expired token';
      return res.status(401).json({ success: false, message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists and has accountType
    if (!req.user || !req.user.accountType) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please log in.',
      });
    }

    if (!roles.includes(req.user.accountType)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.accountType}' is not authorized to access this route`,
      });
    }
    next();
  };
};
