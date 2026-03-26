import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

/**
 * Login Page Component
 * Design System: The Architectural Ledger
 * - Professional login form with account type selection
 * - Owner vs Tenant login modes
 * - Password visibility toggle
 * - Remember device option
 */
export default function Login({ onLogin, onSignupClick, onForgotPassword }) {
  const [loginType, setLoginType] = useState('owner');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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

    // Simulate API call
    setTimeout(() => {
      onLogin({
        id: Math.random().toString(36).substr(2, 9),
        email: formData.email,
        accountType: loginType,
        rememberDevice: formData.rememberDevice,
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f3faff' }}>
      {/* Left Side: Visual Anchor */}
      <section
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-16"
        style={{
          background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
        }}
      >
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay"
          style={{
            backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAZ_7dBCZHG1pASNX8lWS50JzqdJmdEf57JEeUbsPQxCksYtmU0ZQeOSUUVCTuS4RmslrCyvCFutDt0MIOEiklVxwEBt0he4Lh0nZKG_lR9AT0dKDI53-P3Mqt2hLXnC2uJqFBTw2KEannTZxzz6UVikWLinITBaYZgLbPvbIk1q8ta1KBROvEp8jL-TRlVjFeoAunys_NoOkR5fKWJGgkGTDoxzf6RI0lr3LvLgjMtK16_v0wfeHToDiC6l1Qc8lYB7qeHF13dLL53)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Content */}
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
          <h2
            className="text-4xl font-bold leading-tight tracking-tight mb-8"
            style={{
              fontFamily: 'Manrope',
              color: '#fff',
            }}
          >
            Architecting the future of rental management.
          </h2>
          <div className="w-24 h-1 mb-8" style={{ backgroundColor: '#b6ebfe' }} />
          <p
            className="text-lg font-medium"
            style={{ color: '#87bbce' }}
          >
            A premium ledger for modern estates. Manage contracts, cash flow, and maintenance with architectural precision.
          </p>
        </div>

        {/* Social Proof */}
        <div className="relative z-10 flex items-center space-x-4">
          <div className="flex -space-x-2">
            <div
              className="w-10 h-10 rounded-full border-2 flex-shrink-0"
              style={{
                backgroundColor: '#b6ebfe',
                borderColor: '#003441',
              }}
            />
            <div
              className="w-10 h-10 rounded-full border-2 flex-shrink-0"
              style={{
                backgroundColor: '#87bbce',
                borderColor: '#003441',
              }}
            />
            <div
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: '#0f4c5c',
                borderColor: '#003441',
                color: '#87bbce',
              }}
            >
              +12k
            </div>
          </div>
          <p
            className="text-sm"
            style={{ color: '#87bbce' }}
          >
            Trusted by owners across 40+ countries.
          </p>
        </div>
      </section>

      {/* Right Side: Login Form */}
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

          {/* Header */}
          <header className="mb-10">
            <h2
              className="text-3xl font-bold tracking-tight mb-2"
              style={{
                fontFamily: 'Manrope',
                color: '#071e27',
              }}
            >
              Welcome back
            </h2>
            <p style={{ color: '#40484b' }}>
              Please enter your credentials to access your ledger.
            </p>
          </header>

          {/* Login Type Toggle */}
          <div
            className="flex p-1 rounded-xl mb-8"
            style={{ backgroundColor: '#e6f6ff' }}
          >
            <button
              type="button"
              onClick={() => setLoginType('owner')}
              className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{
                backgroundColor: loginType === 'owner' ? '#ffffff' : 'transparent',
                color: loginType === 'owner' ? '#003441' : '#40484b',
                boxShadow: loginType === 'owner' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Owner Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType('tenant')}
              className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
              style={{
                color: loginType === 'tenant' ? '#003441' : '#40484b',
              }}
            >
              Tenant Login
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                className="block text-sm font-semibold"
                style={{ color: '#40484b' }}
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors flex-shrink-0"
                  style={{
                    color: '#70787c',
                  }}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="name@estate.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all"
                  style={{
                    backgroundColor: '#ffffff',
                    border: `1px solid #d5ecf8`,
                    color: '#071e27',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#003441')}
                  onBlur={(e) => (e.target.style.borderColor = '#d5ecf8')}
                />
                {errors.email && (
                  <p style={{ color: '#ba1a1a', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="block text-sm font-semibold"
                  style={{ color: '#40484b' }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onForgotPassword) onForgotPassword();
                  }}
                  className="text-xs font-bold hover:underline bg-none border-none cursor-pointer p-0"
                  style={{ color: '#003441' }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors flex-shrink-0"
                  style={{
                    color: '#70787c',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 rounded-xl outline-none transition-all"
                  style={{
                    backgroundColor: '#ffffff',
                    border: `1px solid #d5ecf8`,
                    color: '#071e27',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#003441')}
                  onBlur={(e) => (e.target.style.borderColor = '#d5ecf8')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#70787c' }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p style={{ color: '#ba1a1a', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Remember Device */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                name="rememberDevice"
                checked={formData.rememberDevice}
                onChange={handleInputChange}
                className="h-4 w-4 rounded"
                style={{
                  borderColor: '#d5ecf8',
                  accentColor: '#003441',
                }}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm"
                style={{ color: '#40484b' }}
              >
                Remember this device
              </label>
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
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight size={20} />
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div
                className="absolute inset-0 flex items-center"
                style={{ borderTopColor: 'rgba(112, 120, 124, 0.3)' }}
              >
                <div className="w-full" style={{ borderTop: '1px solid rgba(112, 120, 124, 0.3)' }} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span
                  className="px-4"
                  style={{
                    backgroundColor: '#f3faff',
                    color: '#40484b',
                    fontWeight: '500',
                  }}
                >
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#071e27',
                  border: '1px solid rgba(112, 120, 124, 0.2)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.909 3.154-1.908 4.154-1.286 1.286-3.303 2.693-7.84 2.693-7.07 0-12.87-5.715-12.87-12.786 0-7.071 5.8-12.786 12.87-12.786 3.411 0 6.146 1.337 8.01 3.132l2.21-2.21C18.173 1.08 15.601 0 12.48 0 5.58 0 0 5.58 0 12.5s5.58 12.5 12.5 12.5c3.75 0 6.58-1.25 8.75-3.5 2.25-2.25 2.9-5.4 2.9-8 0-.6-.05-1.2-.15-1.75h-8.52Z" />
                </svg>
                <span className="text-sm">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#071e27',
                  border: '1px solid rgba(112, 120, 124, 0.2)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">GitHub</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <footer className="mt-12 text-center">
              <p className="text-sm" style={{ color: '#40484b' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSignupClick}
                  className="font-bold hover:underline"
                  style={{ color: '#003441' }}
                >
                  Sign up instead
                </button>
              </p>
            </footer>
          </form>

          {/* Footer Links */}
          <div className="mt-20 flex flex-wrap justify-center gap-6 text-xs font-medium">
            <a href="#" className="hover:underline" style={{ color: '#70787c' }}>
              Privacy Policy
            </a>
            <a href="#" className="hover:underline" style={{ color: '#70787c' }}>
              Terms of Service
            </a>
            <a href="#" className="hover:underline" style={{ color: '#70787c' }}>
              Security
            </a>
            <a href="#" className="hover:underline" style={{ color: '#70787c' }}>
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
