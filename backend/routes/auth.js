import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken, generateBackupCodes } from '../utils/tokenUtils.js';
import { sendPasswordResetEmail, sendTwoFactorEmail } from '../utils/emailUtils.js';
import { protect } from '../middleware/auth.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
  '/signup',
  [
    body('fullName', 'Full name is required').trim().notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('accountType', 'Account type must be owner or tenant').isIn(['owner', 'tenant']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { fullName, email, password, accountType } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Create new user
      user = new User({
        fullName,
        email,
        password,
        accountType,
      });

      await user.save();

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
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Validate email and password
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
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
        await user.save();

        return res.status(401).json({ success: false, message: 'Invalid credentials' });
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

// @route   POST /api/auth/verify-2fa
// @desc    Verify 2FA code
// @access  Private (requires temp token)
router.post('/verify-2fa', protect, async (req, res) => {
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
router.post('/confirm-2fa', protect, async (req, res) => {
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
router.post('/forgot-password', [body('email', 'Please include a valid email').isEmail()], async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Send email
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Error sending email' });
    }

    res.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  '/reset-password',
  [
    body('token', 'Token is required').notEmpty(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
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

export default router;
