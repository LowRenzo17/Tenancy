import { useState } from 'react';
import { ArrowRight, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { createPasswordResetRequest, sendPasswordResetEmail, hasRecentResetRequest } from '../lib/passwordResetUtils';
import apiClient from '../lib/api';

/**
 * Forgot Password Page
 * Design System: The Architectural Ledger
 * - Email verification for password reset
 * - Token generation and email sending
 * - Rate limiting to prevent abuse
 */
export default function ForgotPassword({ onBack, onResetSent }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const validateEmail = (emailValue) => {
    const newErrors = {};
    if (!emailValue) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      newErrors.email = 'Please enter a valid email address';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateEmail(email);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check for recent reset requests (rate limiting)
    if (hasRecentResetRequest(email, 5)) {
      setErrors({
        email: 'Please wait 5 minutes before requesting another reset link',
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await apiClient.forgotPassword(email);

      setSubmitted(true);
      setMessage(`Reset link sent to ${email}. Check your inbox for the verification email.`);
      
      // Notify parent component
      if (onResetSent) {
        onResetSent(email);
      }
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to send reset email. Please make sure the account exists and is active.',
      });
    }
    setIsLoading(false);
  };

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
            <Mail size={32} className="text-primary-fixed-dim" />
            <h2 className="text-3xl font-bold text-primary-foreground">
              Account Recovery
            </h2>
          </div>
          <div className="w-24 h-1 mb-8 bg-primary-fixed-dim" />
          <p className="text-lg font-medium text-primary-foreground/80">
            Forgot your password? No problem. We'll send you a secure link to reset it. Your account security is our priority.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-primary-foreground/80">
            ✓ Secure verification link<br />
            ✓ Link expires in 1 hour<br />
            ✓ Rate-limited for safety
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

          {!submitted ? (
            <>
              {/* Header */}
              <header className="mb-10">
                <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
                  Reset Your Password
                </h2>
                <p className="text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </header>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@estate.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all input-field ${errors.email ? 'border-destructive' : 'border-border'}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email}
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
                  <ArrowRight size={20} />
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-3 px-6 font-semibold rounded-xl transition-all bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                >
                  Back to Login
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-8 p-4 rounded-lg bg-secondary border border-border">
                <p className="text-sm text-primary">
                  💡 <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
                </p>
              </div>
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
                    Check Your Email
                  </h2>
                  <p className="text-muted-foreground">
                    {message}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-orange-100 border border-orange-300">
                  <p className="text-sm text-orange-800">
                    ⏱️ The reset link will expire in <strong>1 hour</strong> for security reasons.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail('');
                    }}
                    className="w-full py-3 px-6 font-semibold rounded-xl transition-all btn-primary"
                  >
                    Try Another Email
                  </button>

                  <button
                    onClick={onBack}
                    className="w-full py-3 px-6 font-semibold rounded-xl transition-all bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground">
              Remember your password? <a href="#" onClick={onBack} className="text-primary font-semibold hover:underline">Sign in instead</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
