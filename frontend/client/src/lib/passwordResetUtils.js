/**
 * Password Reset Utilities
 * Handles secure token generation, validation, and expiration
 */

// Generate a secure reset token
export function generateResetToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Create a password reset request
export function createPasswordResetRequest(email) {
  const token = generateResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

  const resetRequest = {
    email,
    token,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
    used: false,
  };

  // Store in localStorage (in production, this would be in a database)
  const requests = JSON.parse(localStorage.getItem('tenancy_password_resets') || '[]');
  requests.push(resetRequest);
  localStorage.setItem('tenancy_password_resets', JSON.stringify(requests));

  return resetRequest;
}

// Validate a reset token
export function validateResetToken(token) {
  const requests = JSON.parse(localStorage.getItem('tenancy_password_resets') || '[]');
  const request = requests.find(r => r.token === token);

  if (!request) {
    return { valid: false, error: 'Invalid reset token' };
  }

  if (request.used) {
    return { valid: false, error: 'This reset link has already been used' };
  }

  const expiresAt = new Date(request.expiresAt);
  if (new Date() > expiresAt) {
    return { valid: false, error: 'This reset link has expired. Please request a new one.' };
  }

  return { valid: true, email: request.email, token };
}

// Complete password reset
export function completePasswordReset(token, newPassword) {
  const validation = validateResetToken(token);
  if (!validation.valid) {
    return validation;
  }

  // Update user password in localStorage
  const users = JSON.parse(localStorage.getItem('tenancy_users') || '[]');
  const userIndex = users.findIndex(u => u.email === validation.email);

  if (userIndex === -1) {
    return { valid: false, error: 'User not found' };
  }

  // Hash password (in production, use bcrypt or similar)
  users[userIndex].password = hashPassword(newPassword);
  users[userIndex].passwordUpdatedAt = new Date().toISOString();
  localStorage.setItem('tenancy_users', JSON.stringify(users));

  // Mark token as used
  const requests = JSON.parse(localStorage.getItem('tenancy_password_resets') || '[]');
  const requestIndex = requests.findIndex(r => r.token === token);
  if (requestIndex !== -1) {
    requests[requestIndex].used = true;
    requests[requestIndex].completedAt = new Date().toISOString();
    localStorage.setItem('tenancy_password_resets', JSON.stringify(requests));
  }

  return { valid: true, message: 'Password reset successfully' };
}

// Simple password hash (for demo purposes - use bcrypt in production)
export function hashPassword(password) {
  return btoa(password); // Base64 encoding for demo
}

// Verify password
export function verifyPassword(password, hash) {
  return btoa(password) === hash;
}

// Get password reset request history
export function getPasswordResetHistory(email) {
  const requests = JSON.parse(localStorage.getItem('tenancy_password_resets') || '[]');
  return requests.filter(r => r.email === email);
}

// Check if user has recent reset requests (prevent abuse)
export function hasRecentResetRequest(email, minutesThreshold = 5) {
  const history = getPasswordResetHistory(email);
  const recentRequests = history.filter(r => {
    const createdAt = new Date(r.createdAt);
    const now = new Date();
    const minutesDiff = (now - createdAt) / (1000 * 60);
    return minutesDiff < minutesThreshold && !r.used;
  });
  return recentRequests.length > 0;
}

// Send reset email (simulated)
export function sendPasswordResetEmail(email, token) {
  const resetLink = `${window.location.origin}?resetToken=${token}`;
  
  // In production, this would call a backend API to send email
  const emailContent = {
    to: email,
    subject: 'Reset Your Tenancy Slate Password',
    body: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    resetLink,
  };

  // Log to console for demo purposes
  console.log('📧 Password Reset Email:', emailContent);

  // Store email log
  const emailLogs = JSON.parse(localStorage.getItem('tenancy_email_logs') || '[]');
  emailLogs.push({
    ...emailContent,
    sentAt: new Date().toISOString(),
  });
  localStorage.setItem('tenancy_email_logs', JSON.stringify(emailLogs));

  return emailContent;
}

// Get reset token from URL
export function getResetTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('resetToken');
}

// Validate password strength
export function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password),
  };
}

// Calculate password strength score
export function calculatePasswordStrength(password) {
  let strength = 0;

  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[!@#$%^&*]/.test(password)) strength += 25;

  return Math.min(strength, 100);
}

// Get password strength label
export function getPasswordStrengthLabel(strength) {
  if (strength < 30) return { label: 'Weak', color: '#dc2626' };
  if (strength < 60) return { label: 'Fair', color: '#f59e0b' };
  if (strength < 80) return { label: 'Good', color: '#3b82f6' };
  return { label: 'Strong', color: '#16a34a' };
}
