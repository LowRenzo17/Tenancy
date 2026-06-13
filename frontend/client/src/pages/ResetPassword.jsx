import { useState, useEffect } from 'react';
import { ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import {
  validatePasswordStrength, 
  getPasswordStrengthLabel 
} from '../lib/passwordResetUtils';
import apiClient from '../lib/api';

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
    const validate = async () => {
      try {
        await apiClient.validateResetToken(token);
        setTokenValid({ valid: true });
      } catch (error) {
        setTokenValid({ valid: false, error: error.message || 'Invalid or expired reset token.' });
      }
    };
    if (token) validate();
    else setTokenValid({ valid: false, error: 'No token provided.' });
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

    try {
      await apiClient.resetPassword(token, password);
      
      setResetComplete(true);
      if (onResetComplete) {
        onResetComplete();
      }
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to reset password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Token validation error
  if (tokenValid && !tokenValid.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-destructive/10">
              <AlertCircle size={32} className="text-destructive" />
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                Link Invalid or Expired
              </h2>
              <p className="text-muted-foreground">
                {tokenValid.error}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                Please request a new password reset link to continue.
              </p>
            </div>

            <button
              onClick={onBack}
              className="w-full py-3 px-6 font-semibold rounded-xl transition-all btn-primary"
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-16 bg-primary">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground">
            Tenancy Slate
          </h1>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <Lock size={32} className="text-primary-fixed-dim" />
            <h2 className="text-3xl font-bold text-primary-foreground">
              Secure Reset
            </h2>
          </div>
          <div className="w-24 h-1 mb-8 bg-primary-fixed-dim" />
          <p className="text-lg font-medium text-primary-foreground/80">
            Create a strong, unique password to protect your account. We enforce security best practices.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-primary-foreground/80">
            ✓ 8+ characters required<br />
            ✓ Mix of letters, numbers & symbols<br />
            ✓ Secure encryption
          </p>
        </div>
      </section>

      {/* Right Side */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12">
            <h2 className="text-2xl font-extrabold tracking-tight text-primary">
              Tenancy Slate
            </h2>
          </div>

          {!resetComplete ? (
            <>
              {/* Header */}
              <header className="mb-10">
                <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
                  Create New Password
                </h2>
                <p className="text-muted-foreground">
                  Enter a strong password to secure your account.
                </p>
              </header>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-muted-foreground">
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
                      className={`w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all input-field ${errors.password ? 'border-destructive' : 'border-border'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password}
                    </p>
                  )}

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
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
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
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
                  <label className="block text-sm font-semibold text-muted-foreground">
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
                      className={`w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all input-field ${errors.confirmPassword ? 'border-destructive' : 'border-border'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="p-4 rounded-lg flex items-start gap-3 bg-destructive/10 border border-destructive/20">
                    <AlertCircle size={20} className="text-destructive mt-[2px]" />
                    <p className="text-sm text-destructive">
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Password Requirements */}
                <div className="p-4 rounded-lg space-y-2 bg-secondary border border-border">
                  <p className="text-sm font-semibold text-primary">
                    Password Requirements:
                  </p>
                  <ul className="text-xs text-primary leading-relaxed">
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
                  className="w-full py-4 px-6 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                  <ArrowRight size={20} />
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-3 px-6 font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all border border-border"
                >
                  Back to Login
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center space-y-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-green-100">
                  <CheckCircle size={32} className="text-green-600" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-2 text-foreground">
                    Password Reset Successfully
                  </h2>
                  <p className="text-muted-foreground">
                    Your password has been securely updated. You can now log in with your new password.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-100 border border-green-300">
                  <p className="text-sm text-green-800">
                    ✓ Your account is now secure with your new password.
                  </p>
                </div>

                <button
                  onClick={onBack}
                  className="w-full py-3 px-6 font-semibold rounded-xl transition-all btn-primary"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground">
              Need help? <a href="#" className="text-primary font-semibold hover:underline">Contact support</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
