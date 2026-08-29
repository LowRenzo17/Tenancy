/**
 * Password Reset Utilities
 * Client-side helpers for password-reset UI only.
 * Token creation, validation, and email delivery are performed by the backend.
 */

// Get reset token from URL
export function getResetTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('token') || params.get('resetToken');
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
  if (!/[\W_]/.test(password)) {
    errors.push('Password must contain at least one special character');
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
  if (/[\W_]/.test(password)) strength += 25;

  return Math.min(strength, 100);
}

// Get password strength label
export function getPasswordStrengthLabel(strength) {
  if (strength < 30) return { label: 'Weak', color: '#dc2626' };
  if (strength < 60) return { label: 'Fair', color: '#f59e0b' };
  if (strength < 80) return { label: 'Good', color: '#3b82f6' };
  return { label: 'Strong', color: '#16a34a' };
}
