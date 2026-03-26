import { useState, useEffect } from 'react';
import { ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { 
  validateResetToken, 
  completePasswordReset, 
  validatePasswordStrength, 
  getPasswordStrengthLabel 
} from '../lib/passwordResetUtils';

/**
 * Reset Password Page
 * Design System: The Architectural Ledger
 * - Token validation
 * - Password strength requirements
 * - Secure password reset completion
 */
export default function ResetPassword({ token, onResetComplete, onBack }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tokenValid, setTokenValid] = useState(null);
  const [resetComplete, setResetComplete] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validate token on mount
  useEffect(() => {
    const validation = validateResetToken(token);
    setTokenValid(validation);
  }, [token]);

  // Calculate password strength
  useEffect(() => {
    if (password) {
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength.strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const validateForm = () => {
    const newErrors = {};
    const strengthValidation = validatePasswordStrength(password);

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!strengthValidation.valid) {
      newErrors.password = strengthValidation.errors[0];
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulate password reset processing
    setTimeout(() => {
      try {
        const result = completePasswordReset(token, password);
        
        if (result.valid) {
          setResetComplete(true);
          if (onResetComplete) {
            onResetComplete();
          }
        } else {
          setErrors({
            submit: result.error || 'Failed to reset password. Please try again.',
          });
        }
      } catch (error) {
        setErrors({
          submit: 'An error occurred. Please try again.',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  // Token validation error
  if (tokenValid && !tokenValid.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8" style={{ backgroundColor: '#f3faff' }}>
        <div className="w-full max-w-md">
          <div className="text-center space-y-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: '#fee2e2' }}
            >
              <AlertCircle size={32} style={{ color: '#dc2626' }} />
            </div>

            <div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: 'Manrope',
                  color: '#071e27',
                }}
              >
                Link Invalid or Expired
              </h2>
              <p style={{ color: '#40484b' }}>
                {tokenValid.error}
              </p>
            </div>

            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
              }}
            >
              <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>
                Please request a new password reset link to continue.
              </p>
            </div>

            <button
              onClick={onBack}
              className="w-full py-3 px-6 font-semibold rounded-xl transition-all text-white"
              style={{
                background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (tokenValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f3faff' }}>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto mb-4"
            style={{ borderTopColor: '#003441' }}
          />
          <p style={{ color: '#40484b' }}>Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f3faff' }}>
      {/* Left Side */}
      <section
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-16"
        style={{
          background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
        }}
      >
        <div className="relative z-10">
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              fontFamily: 'Manrope',
              color: '#fff',
            }}
          >
            Tenancy Slate
          </h1>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <Lock size={32} style={{ color: '#b6ebfe' }} />
            <h2
              className="text-3xl font-bold"
              style={{
                fontFamily: 'Manrope',
                color: '#fff',
              }}
            >
              Secure Reset
            </h2>
          </div>
          <div className="w-24 h-1 mb-8" style={{ backgroundColor: '#b6ebfe' }} />
          <p
            className="text-lg font-medium"
            style={{ color: '#87bbce' }}
          >
            Create a strong, unique password to protect your account. We enforce security best practices.
          </p>
        </div>

        <div className="relative z-10">
          <p
            className="text-sm"
            style={{ color: '#87bbce' }}
          >
            ✓ 8+ characters required<br />
            ✓ Mix of letters, numbers & symbols<br />
            ✓ Secure encryption
          </p>
        </div>
      </section>

      {/* Right Side */}
      <section
        className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24"
        style={{ backgroundColor: '#f3faff' }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12">
            <h2
              className="text-2xl font-extrabold tracking-tight"
              style={{
                fontFamily: 'Manrope',
                color: '#003441',
              }}
            >
              Tenancy Slate
            </h2>
          </div>

          {!resetComplete ? (
            <>
              {/* Header */}
              <header className="mb-10">
                <h2
                  className="text-3xl font-bold tracking-tight mb-2"
                  style={{
                    fontFamily: 'Manrope',
                    color: '#071e27',
                  }}
                >
                  Create New Password
                </h2>
                <p style={{ color: '#40484b' }}>
                  Enter a strong password to secure your account.
                </p>
              </header>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Input */}
                <div className="space-y-2">
                  <label
                    className="block text-sm font-semibold"
                    style={{ color: '#40484b' }}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors(prev => ({ ...prev, password: '' }));
                        }
                      }}
                      className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all"
                      style={{
                        backgroundColor: '#ffffff',
                        border: `1px solid ${errors.password ? '#ba1a1a' : '#d5ecf8'}`,
                        color: '#071e27',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors"
                      style={{ color: '#70787c' }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p style={{ color: '#ba1a1a', fontSize: '0.75rem' }}>
                      {errors.password}
                    </p>
                  )}

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: '0.75rem', color: '#40484b' }}>
                          Password Strength
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: getPasswordStrengthLabel(passwordStrength).color,
                          }}
                        >
                          {getPasswordStrengthLabel(passwordStrength).label}
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: '#e6f6ff' }}
                      >
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${passwordStrength}%`,
                            backgroundColor: getPasswordStrengthLabel(passwordStrength).color,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label
                    className="block text-sm font-semibold"
                    style={{ color: '#40484b' }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) {
                          setErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }
                      }}
                      className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all"
                      style={{
                        backgroundColor: '#ffffff',
                        border: `1px solid ${errors.confirmPassword ? '#ba1a1a' : '#d5ecf8'}`,
                        color: '#071e27',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors"
                      style={{ color: '#70787c' }}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p style={{ color: '#ba1a1a', fontSize: '0.75rem' }}>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div
                    className="p-4 rounded-lg flex items-start gap-3"
                    style={{
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fca5a5',
                    }}
                  >
                    <AlertCircle size={20} style={{ color: '#dc2626', marginTop: '2px' }} />
                    <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Password Requirements */}
                <div
                  className="p-4 rounded-lg space-y-2"
                  style={{
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' }}>
                    Password Requirements:
                  </p>
                  <ul style={{ fontSize: '0.75rem', color: '#0369a1', lineHeight: '1.6' }}>
                    <li>✓ At least 8 characters</li>
                    <li>✓ One uppercase letter (A-Z)</li>
                    <li>✓ One lowercase letter (a-z)</li>
                    <li>✓ One number (0-9)</li>
                    <li>✓ One special character (!@#$%^&*)</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
                    fontFamily: 'Manrope',
                  }}
                >
                  <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                  <ArrowRight size={20} />
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-3 px-6 font-semibold rounded-xl transition-all"
                  style={{
                    backgroundColor: '#e6f6ff',
                    color: '#003441',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d5ecf8')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
                >
                  Back to Login
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center space-y-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{ backgroundColor: '#dcfce7' }}
                >
                  <CheckCircle size={32} style={{ color: '#16a34a' }} />
                </div>

                <div>
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{
                      fontFamily: 'Manrope',
                      color: '#071e27',
                    }}
                  >
                    Password Reset Successfully
                  </h2>
                  <p style={{ color: '#40484b' }}>
                    Your password has been securely updated. You can now log in with your new password.
                  </p>
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: '#dcfce7',
                    border: '1px solid #86efac',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', color: '#166534' }}>
                    ✓ Your account is now secure with your new password.
                  </p>
                </div>

                <button
                  onClick={onBack}
                  className="w-full py-3 px-6 font-semibold rounded-xl transition-all text-white"
                  style={{
                    background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Back to Login
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs" style={{ color: '#70787c' }}>
              Need help? <a href="#" style={{ color: '#003441', fontWeight: '600' }}>Contact support</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
