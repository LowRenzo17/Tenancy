import { useState } from 'react';
import { ArrowRight, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { createPasswordResetRequest, sendPasswordResetEmail, hasRecentResetRequest } from '../lib/passwordResetUtils';

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

    // Simulate email sending delay
    setTimeout(() => {
      try {
        // Create reset request
        const resetRequest = createPasswordResetRequest(email);

        // Send email (simulated)
        sendPasswordResetEmail(email, resetRequest.token);

        setSubmitted(true);
        setMessage(`Reset link sent to ${email}. Check your inbox for the verification email.`);
        
        // Notify parent component
        if (onResetSent) {
          onResetSent(email);
        }
      } catch (error) {
        setErrors({
          submit: 'Failed to send reset email. Please try again.',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

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
            <Mail size={32} style={{ color: '#b6ebfe' }} />
            <h2
              className="text-3xl font-bold"
              style={{
                fontFamily: 'Manrope',
                color: '#fff',
              }}
            >
              Account Recovery
            </h2>
          </div>
          <div className="w-24 h-1 mb-8" style={{ backgroundColor: '#b6ebfe' }} />
          <p
            className="text-lg font-medium"
            style={{ color: '#87bbce' }}
          >
            Forgot your password? No problem. We'll send you a secure link to reset it. Your account security is our priority.
          </p>
        </div>

        <div className="relative z-10">
          <p
            className="text-sm"
            style={{ color: '#87bbce' }}
          >
            ✓ Secure verification link<br />
            ✓ Link expires in 1 hour<br />
            ✓ Rate-limited for safety
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

          {!submitted ? (
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
                  Reset Your Password
                </h2>
                <p style={{ color: '#40484b' }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </header>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    className="block text-sm font-semibold"
                    style={{ color: '#40484b' }}
                  >
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
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                    style={{
                      backgroundColor: '#ffffff',
                      border: `1px solid ${errors.email ? '#ba1a1a' : '#d5ecf8'}`,
                      color: '#071e27',
                    }}
                  />
                  {errors.email && (
                    <p style={{ color: '#ba1a1a', fontSize: '0.75rem' }}>
                      {errors.email}
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
                  <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
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

              {/* Info Box */}
              <div
                className="mt-8 p-4 rounded-lg"
                style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                }}
              >
                <p style={{ fontSize: '0.875rem', color: '#0369a1' }}>
                  💡 <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
                </p>
              </div>
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
                    Check Your Email
                  </h2>
                  <p style={{ color: '#40484b' }}>
                    {message}
                  </p>
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
                    ⏱️ The reset link will expire in <strong>1 hour</strong> for security reasons.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail('');
                    }}
                    className="w-full py-3 px-6 font-semibold rounded-xl transition-all text-white"
                    style={{
                      background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Try Another Email
                  </button>

                  <button
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
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs" style={{ color: '#70787c' }}>
              Remember your password? <a href="#" onClick={onBack} style={{ color: '#003441', fontWeight: '600' }}>Sign in instead</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
