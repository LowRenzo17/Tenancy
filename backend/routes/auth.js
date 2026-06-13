import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { generateToken, generateBackupCodes } from '../utils/tokenUtils.js';
import { sendPasswordResetEmail, sendTwoFactorEmail } from '../utils/emailUtils.js';
import { protect } from '../middleware/auth.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const router = express.Router();

const sensitiveAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
  '/signup',
  [
    body('fullName', 'Full name is required').trim().notEmpty().isLength({ max: 100 }),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special symbol')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
    body('accountType', 'Account type must be owner or tenant').isIn(['owner', 'tenant']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { fullName, email, password, accountType } = req.body;
      const normalizedEmail = email.trim().toLowerCase();

      // Check if user already exists (case-insensitive)
      let user = await User.findOne({ email: normalizedEmail });
      if (user) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Create new user
      user = new User({
        fullName,
        email: normalizedEmail,
        password,
        accountType,
      });

      await user.save();

      // Check if user is a tenant and link to Tenant document
      if (accountType === 'tenant') {
        const tenantRecord = await Tenant.findOne({ email: email.toLowerCase() });
        if (tenantRecord) {
          tenantRecord.userId = user._id;
          await tenantRecord.save();
        }
      }

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          accountType: user.accountType,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password, accountType } = req.body;
      const normalizedEmail = email.trim().toLowerCase();

      // Validate email and password
      const user = await User.findOne({ email: normalizedEmail }).select('+password');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Enforce Role boundaries
      if (accountType && user.accountType !== accountType) {
        return res.status(403).json({ success: false, message: `Access denied. Please log in as ${user.accountType === 'owner' ? 'an Owner' : 'a Tenant'}.` });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        // Log failed login attempt
        user.loginHistory.push({
          timestamp: new Date(),
          status: 'failed',
          twoFactorUsed: false,
        });
        user.trimLoginHistory();
        await user.save();

        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Force temporary password reset check
      if (user.requiresPasswordChange) {
        const tempToken = generateToken(user._id);
        return res.status(200).json({
          success: true,
          requiresPasswordChange: true,
          tempToken,
          message: 'Security requirement: Please set a permanent password',
        });
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Generate temporary token for 2FA verification
        const tempToken = generateToken(user._id);
        return res.status(200).json({
          success: true,
          requiresTwoFactor: true,
          tempToken,
          message: 'Please verify with 2FA',
        });
      }

      // Log successful login
      user.lastLogin = new Date();
      user.loginHistory.push({
        timestamp: new Date(),
        status: 'success',
        twoFactorUsed: false,
      });
      user.trimLoginHistory();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          accountType: user.accountType,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   POST /api/auth/force-password-reset
// @desc    Reset autogenerated password after first login
// @access  Public (using temp token)
router.post(
  '/force-password-reset',
  sensitiveAuthLimiter,
  [
    body('tempToken', 'Valid token required').notEmpty(),
    body('newPassword', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special symbol')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { tempToken, newPassword } = req.body;

    try {
      const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (!user.requiresPasswordChange) {
        return res.status(400).json({ success: false, message: 'Password has already been changed' });
      }

      user.password = newPassword;
      user.requiresPasswordChange = false;
      await user.save();

      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        message: 'Password successfully updated.',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          accountType: user.accountType,
        },
      });
    } catch (error) {
      console.error("Force password reset error:", error);
      return res.status(401).json({ success: false, message: error.name === 'TokenExpiredError' ? 'Token expired' : (error.message || 'Invalid or expired session token') });
    }
  }
);

// @route   POST /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.post('/google', sensitiveAuthLimiter, async (req, res) => {
  try {
    const { token, accountType } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    // Fetch user profile from Google using the access token
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!googleResponse.ok) {
      return res.status(401).json({ success: false, message: 'Invalid Google token' });
    }

    const profile = await googleResponse.json();
    const { email, name } = profile;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email not provided by Google' });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user (Generate a random secure password for Google users)
      const randomPassword = crypto.randomBytes(16).toString('base64') + 'A1!';
      user = new User({
        fullName: name,
        email,
        password: randomPassword,
        accountType: accountType || 'tenant', // Default to tenant if not specified
      });
      await user.save();

      // Check if user is a tenant and link to Tenant document
      if (user.accountType === 'tenant') {
        const tenantRecord = await Tenant.findOne({ email: email.toLowerCase() });
        if (tenantRecord) {
          tenantRecord.userId = user._id;
          await tenantRecord.save();
        }
      }
    } else {
      // Enforce Role boundaries for existing users if accountType was provided by the UI
      if (accountType && user.accountType !== accountType) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Please log in as ${user.accountType === 'owner' ? 'an Owner' : 'a Tenant'}.` 
        });
      }
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      const tempToken = generateToken(user._id);
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        tempToken,
        message: 'Please verify with 2FA',
      });
    }

    // Log successful login
    user.lastLogin = new Date();
    user.loginHistory.push({
      timestamp: new Date(),
      status: 'success',
      twoFactorUsed: false,
    });
    user.trimLoginHistory();
    await user.save();

    // Generate token
    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
});

// @route   POST /api/auth/verify-2fa
// @desc    Verify 2FA code
// @access  Private (requires temp token)
router.post('/verify-2fa', sensitiveAuthLimiter, protect, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }

    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is not enabled' });
    }

    // Verify TOTP code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: parseInt(process.env.TOTP_WINDOW) || 2,
    });

    if (!verified) {
      return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
    }

    // Log successful login with 2FA
    user.lastLogin = new Date();
    user.loginHistory.push({
      timestamp: new Date(),
      status: 'success',
      twoFactorUsed: true,
    });
    user.trimLoginHistory();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/enable-2fa
// @desc    Enable two-factor authentication
// @access  Private
router.post('/enable-2fa', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Tenancy Slate (${user.email})`,
      issuer: 'Tenancy Slate',
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    res.json({
      success: true,
      secret: secret.base32,
      qrCode,
      backupCodes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/confirm-2fa
// @desc    Confirm and enable 2FA with verification code
// @access  Private
router.post('/confirm-2fa', sensitiveAuthLimiter, protect, async (req, res) => {
  try {
    const { secret, code, backupCodes } = req.body;

    if (!secret || !code || !backupCodes) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: parseInt(process.env.TOTP_WINDOW) || 2,
    });

    if (!verified) {
      return res.status(401).json({ success: false, message: 'Invalid verification code' });
    }

    // Enable 2FA
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: '2FA enabled successfully',
      user: {
        id: user._id,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/disable-2fa
// @desc    Disable two-factor authentication
// @access  Private
router.post('/disable-2fa', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
      },
      { new: true }
    );

    res.json({
      success: true,
      message: '2FA disabled successfully',
      user: {
        id: user._id,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', sensitiveAuthLimiter, [body('email', 'Please include a valid email').isEmail().normalizeEmail()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    // Always return 200 to prevent email enumeration attacks
    if (!user || user.isActive === false) {
      return res.status(200).json({
        success: true,
        message: 'If that email is registered, a reset link has been sent.',
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const emailSent = await sendPasswordResetEmail(normalizedEmail, resetToken);
    if (!emailSent) {
      console.error(`[WARN] Failed to dispatch password reset email to ${normalizedEmail}`);
    }

    res.status(200).json({
      success: true,
      message: 'If that email is registered, a reset link has been sent.',
    });
  } catch (error) {
    console.error('[ERROR] forgot-password:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  '/reset-password',
  sensitiveAuthLimiter,
  [
    body('token', 'Token is required').notEmpty(),
    body('password', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special symbol')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
  ],
  async (req, res) => {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user || user.isActive === false) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token, or account is inactive' });
      }

      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   GET /api/auth/validate-reset-token/:token
// @desc    Validate a password reset token
// @access  Public
router.get('/validate-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user || user.isActive === false) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    res.json({ success: true, message: 'Token is valid' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
        phone: user.phone,
        address: user.address,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone, address },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        accountType: user.accountType,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/login-history
// @desc    Get user login history
// @access  Private
router.get('/login-history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      loginHistory: user.loginHistory.sort((a, b) => b.timestamp - a.timestamp),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/trusted-devices
// @desc    Get trusted devices
// @access  Private
router.get('/trusted-devices', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      trustedDevices: user.trustedDevices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/add-trusted-device
// @desc    Add a trusted device
// @access  Private
router.post('/add-trusted-device', protect, async (req, res) => {
  try {
    const { deviceId, deviceName, os, browser, location } = req.body;

    const user = await User.findById(req.user._id);

    user.trustedDevices.push({
      deviceId,
      deviceName,
      os,
      browser,
      location,
      trustedAt: new Date(),
      lastUsed: new Date(),
      isActive: true,
    });

    await user.save();

    res.json({
      success: true,
      message: 'Device added to trusted devices',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/auth/trusted-devices/:deviceId
// @desc    Remove a trusted device
// @access  Private
router.delete('/trusted-devices/:deviceId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.trustedDevices = user.trustedDevices.filter((device) => device.deviceId !== req.params.deviceId);

    await user.save();

    res.json({
      success: true,
      message: 'Device removed from trusted devices',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/users/search
// @desc    Find a user by email (for chat — returns safe public fields only)
// @access  Private
router.get('/users/search', protect, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email query is required' });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('_id fullName email accountType');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email address' });
    }
    // Don't allow messaging yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself' });
    }
    res.json({ success: true, user: { _id: user._id, fullName: user.fullName, email: user.email, accountType: user.accountType } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
