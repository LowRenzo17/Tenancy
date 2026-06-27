import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Wallet, Users, ShieldCheck } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useLocation } from 'wouter';
import SEO from '../components/SEO';

/**
 * Login Page Component
 * Design System: The Architectural Ledger
 * - Professional login form with account type selection
 * - Owner vs Tenant login modes
 * - Password visibility toggle
 * - Remember device option
 */
export default function Login({ onLogin, onGoogleLogin, onSignupClick, onForgotPassword, onForcePasswordReset }) {
  const [, setLocation] = useLocation();
  const [loginType, setLoginType] = useState('owner');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Security Overrides
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');

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
    setErrors({});

    try {
      const response = await onLogin?.(formData.email, formData.password, loginType, formData.rememberDevice);
      
      if (response?.requiresPasswordChange) {
        setRequiresPasswordChange(true);
        setTempToken(response.tempToken);
        // We purposely halt standard execution here
        return;
      }
      
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err?.message || 'Login failed. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForcePasswordReset = async (e) => {
    e.preventDefault();
    if(newPassword.length < 6) {
      setErrors({ reset: 'Password must be at least 6 characters' });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      await onForcePasswordReset(tempToken, newPassword);
      // on success, auth context sets token and AppRouter redirects automatically
    } catch (err) {
      setErrors({ reset: err?.message || 'Failed to update password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const startGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setErrors({});
      try {
        await onGoogleLogin?.(tokenResponse.access_token, loginType);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          submit: err?.message || 'Google login failed.',
        }));
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setErrors((prev) => ({
        ...prev,
        submit: 'Google login was incomplete.',
      }));
    }
  });

  return (
    <div className="flex min-h-screen bg-background">
      <SEO 
        title="Property Management Software Kenya" 
        description="The premium property management system in Kenya. Automate rent collection via M-Pesa, manage tenants, track expenses, and view your ledger with architectural precision."
      />
      {/* Left Side: Visual Anchor */}
      <section className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12 bg-primary">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/assets/login_splash.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Content */}
        <div className="relative z-10 mt-8">
          <h1 
            className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-fit"
            onClick={() => setLocation('/')}
          >
            EstateLedger
          </h1>
        </div>

        <div className="relative z-10 max-w-sm mb-12">
          <h2 className="text-4xl font-semibold leading-tight text-white mb-6">
            Architecting the future of rental management.
          </h2>
          <div className="w-16 h-0.5 mb-6 bg-white/50" />
          <p className="text-base text-white/80 font-normal leading-relaxed">
            A premium ledger for modern estates. Manage contracts, cash flow, and maintenance with architectural precision.
          </p>
        </div>

        {/* Core Features */}
        <div className="relative z-10 space-y-5 mb-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 bg-white/10 p-2 rounded-lg border border-white/5 backdrop-blur-sm">
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide">Automated Cash Flow</h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">Seamless rent tracking and automated invoicing.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="mt-1 bg-white/10 p-2 rounded-lg border border-white/5 backdrop-blur-sm">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide">Tenant Portal</h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">A modern, professional experience for your renters.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 bg-white/10 p-2 rounded-lg border border-white/5 backdrop-blur-sm">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide">Architectural Precision</h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">Zero missing records, unmatched ledger accuracy.</p>
            </div>
          </div>
        </div>

      </section>

      {/* Right Side: Login Form */}
      <section className="w-full lg:w-[55%] flex items-center justify-center p-8 md:p-16 lg:p-24 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12">
            <h2 
              className="text-2xl font-bold tracking-tight text-foreground cursor-pointer hover:opacity-80 transition-opacity inline-block w-fit"
              onClick={() => setLocation('/')}
            >
              EstateLedger
            </h2>
          </div>

          {/* Header */}
          <header className="mb-10">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
              {requiresPasswordChange ? 'Secure Your Account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-foreground/70">
              {requiresPasswordChange 
                ? 'Your property manager has invited you. Please choose a new permanent password to activate your account.'
                : 'Enter your credentials to access your ledger.'}
            </p>
          </header>

          {requiresPasswordChange ? (
            <form onSubmit={handleForcePasswordReset} className="space-y-6">
              {errors.reset && (
                <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md border border-red-100 flex items-start gap-2">
                  <span className="block">{errors.reset}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-transparent border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Securing Account...' : 'Set Password & Login'}
                {!isLoading && <ArrowRight size={16} />}
              </button>
            </form>
          ) : (
            <>
              {/* Login Type Toggle */}
              <div className="flex p-1 rounded-lg mb-8 bg-muted shadow-inner border border-border/50">
                <button
                  type="button"
                  onClick={() => setLoginType('owner')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${loginType === 'owner' ? 'bg-card text-foreground shadow-sm ring-1 ring-border shadow-black/5' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Owner Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('tenant')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${loginType === 'tenant' ? 'bg-card text-foreground shadow-sm ring-1 ring-border shadow-black/5' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Tenant Login
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {errors.submit ? (
                  <div className="p-3 mb-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {errors.submit}
                  </div>
                ) : null}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-foreground">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  placeholder="name@estate.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-3 pr-3 text-sm py-2 bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                />
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onForgotPassword) onForgotPassword();
                  }}
                  className="text-[11px] font-semibold text-foreground hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-3 pr-8 text-sm py-2 bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Remember Device */}
            <div className="flex items-center pt-2 pb-2">
              <input
                type="checkbox"
                id="remember-me"
                name="rememberDevice"
                checked={formData.rememberDevice}
                onChange={handleInputChange}
                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-xs text-muted-foreground select-none"
              >
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm bg-primary text-primary-foreground font-medium rounded-md shadow-sm hover:opacity-90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center" >
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-2 bg-background text-muted-foreground uppercase tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div>
              <button
                type="button"
                onClick={() => startGoogleLogin()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-card border border-border px-3 py-2 text-[13px] font-medium transition-colors hover:bg-secondary text-foreground shadow-sm shadow-black/[0.02]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.909 3.154-1.908 4.154-1.286 1.286-3.303 2.693-7.84 2.693-7.07 0-12.87-5.715-12.87-12.786 0-7.071 5.8-12.786 12.87-12.786 3.411 0 6.146 1.337 8.01 3.132l2.21-2.21C18.173 1.08 15.601 0 12.48 0 5.58 0 0 5.58 0 12.5s5.58 12.5 12.5 12.5c3.75 0 6.58-1.25 8.75-3.5 2.25-2.25 2.9-5.4 2.9-8 0-.6-.05-1.2-.15-1.75h-8.52Z" />
                </svg>
                Google
              </button>
            </div>

            {/* Sign Up Link */}
            <footer className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSignupClick}
                  className="font-semibold text-foreground hover:underline"
                >
                  Sign up instead
                </button>
              </p>
            </footer>
          </form>

          {/* Footer Links */}
          <div className="mt-16 flex flex-wrap justify-center gap-6 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Security
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact Support
            </a>
          </div>
            </>
          )}

        </div>
      </section>
    </div>
  );
}
