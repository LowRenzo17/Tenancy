import mongoose from 'mongoose';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    accountType: {
      type: String,
      enum: ['owner', 'tenant'],
      required: true,
    },
    requiresPasswordChange: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
      select: false,
    },
    backupCodes: [{
      type: String,
      select: false,
    }],
    trustedDevices: [{
      deviceId: String,
      deviceName: String,
      os: String,
      browser: String,
      location: String,
      trustedAt: Date,
      lastUsed: Date,
      isActive: Boolean,
    }],
    loginHistory: [{
      timestamp: Date,
      ipAddress: String,
      deviceInfo: String,
      status: String,
      twoFactorUsed: Boolean,
    }],
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Method to generate a cryptographically secure reset token
userSchema.methods.getResetPasswordToken = function () {
  // Use crypto.randomBytes — Math.random() is not cryptographically secure
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour expiry
  return resetToken;
};

// Helper: trim loginHistory to the most recent N entries
// Prevents the User document exceeding MongoDB's 16MB BSON limit
userSchema.methods.trimLoginHistory = function (maxEntries = 100) {
  if (this.loginHistory.length > maxEntries) {
    this.loginHistory = this.loginHistory.slice(-maxEntries);
  }
};

const User = mongoose.model('User', userSchema);
export default User;
