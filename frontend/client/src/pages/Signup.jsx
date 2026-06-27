import { useState } from 'react';
import { Building2, Users, Wallet, ShieldCheck } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useLocation } from 'wouter';
import SEO from '../components/SEO';
import { validatePasswordStrength } from '../lib/passwordResetUtils';

/**
 * Signup Page Component
 * Design System: The Architectural Ledger
 * - Professional signup form with account type selection
 * - Property Owner vs Tenant account types
 */
export default function Signup({ onSignup, onGoogleSignup, onLoginClick }) {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    accountType: 'owner',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email';
    }

    const strengthValidation = validatePasswordStrength(formData.password);
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!strengthValidation.valid) {
      newErrors.password = strengthValidation.errors[0];
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
      await onSignup?.(
        formData.fullName.trim(),
        formData.email.trim(),
        formData.password,
        formData.accountType,
      );
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err?.message || 'Signup failed. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const startGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setErrors({});

      try {
        await onGoogleSignup?.(tokenResponse.access_token, formData.accountType);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          submit: err?.message || 'Google signup failed. Please try again.',
        }));
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setErrors((prev) => ({
        ...prev,
        submit: 'Google signup was incomplete.',
      }));
    },
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <SEO 
        title="Create Account | Property Management Software" 
        description="Sign up for the premium property management system in Kenya. Connect your properties and tenants with automated cash flow tracking."
      />
      {/* Left Side: Brand & Visuals */}
      <section className="hidden md:flex md:w-[45%] relative overflow-hidden flex-col justify-between p-12 bg-primary">
        {/* Decorative Elements */}
        <div className="absolute inset-0 w-full h-full opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/assets/login_splash.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Top Brand */}
        <div className="relative z-10 mt-8">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-fit"
            onClick={() => setLocation('/')}
          >
            <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center">
              <Building2 size={18} className="text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              EstateLedger
            </span>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="relative z-10 max-w-sm mb-12">
          <h1 className="text-4xl font-semibold leading-tight mb-6 text-white tracking-tight">
            Manage your assets <br />
            <span className="text-white/80">with precision.</span>
          </h1>
          <div className="w-16 h-0.5 mb-6 bg-white/50" />
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

      {/* Right Side: Registration Form */}
      <section className="flex-1 flex flex-col justify-center bg-background p-8 md:p-24 relative">
        <div className="max-w-sm w-full mx-auto">
          {/* Mobile Logo */}
          <div 
            className="md:hidden flex items-center gap-2 mb-12 cursor-pointer hover:opacity-80 transition-opacity w-fit"
            onClick={() => setLocation('/')}
          >
            <Building2 size={24} className="text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              EstateLedger
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground">Join the elite network of property management.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.submit ? (
              <div className="p-3 mb-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {errors.submit}
              </div>
            ) : null}
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-foreground">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Jonathan Sterling"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.fullName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-foreground">
                Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="j.sterling@estate.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-widest text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-3 pr-3 py-2 text-sm bg-card rounded-md border border-border placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm shadow-black/[0.02]"
                />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Account Type Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-foreground mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Property Owner */}
                <label className="cursor-pointer group">
                  <input
                    type="radio"
                    name="accountType"
                    value="owner"
                    checked={formData.accountType === 'owner'}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div
                    className={`p-3 rounded-md text-center flex flex-col items-center gap-2 transition-all border
                      ${formData.accountType === 'owner' 
                        ? 'bg-primary/5 border-primary ring-1 ring-primary shadow-sm' 
                        : 'bg-card border-border hover:border-primary/50 hover:bg-secondary'}
                    `}
                  >
                    <Building2 size={20} className={formData.accountType === 'owner' ? "text-primary" : "text-muted-foreground"} />
                    <span className={`text-[11px] font-semibold tracking-wider uppercase ${formData.accountType === 'owner' ? "text-primary" : "text-muted-foreground"}`}>
                      Estate Director
                    </span>
                  </div>
                </label>

                {/* Tenant */}
                <label className="cursor-pointer group">
                  <input
                    type="radio"
                    name="accountType"
                    value="tenant"
                    checked={formData.accountType === 'tenant'}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div
                    className={`p-3 rounded-md text-center flex flex-col items-center gap-2 transition-all border
                      ${formData.accountType === 'tenant' 
                        ? 'bg-primary/5 border-primary ring-1 ring-primary shadow-sm' 
                        : 'bg-card border-border hover:border-primary/50 hover:bg-secondary'}
                    `}
                  >
                    <Users size={20} className={formData.accountType === 'tenant' ? "text-primary" : "text-muted-foreground"} />
                    <span className={`text-[11px] font-semibold tracking-wider uppercase ${formData.accountType === 'tenant' ? "text-primary" : "text-muted-foreground"}`}>
                      Resident
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-sm bg-primary text-primary-foreground font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-2 bg-background text-muted-foreground uppercase tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Signup */}
            <button
              type="button"
              onClick={() => startGoogleSignup()}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-card border border-border px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-secondary text-foreground shadow-sm shadow-black/[0.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.909 3.154-1.908 4.154-1.286 1.286-3.303 2.693-7.84 2.693-7.07 0-12.87-5.715-12.87-12.786 0-7.071 5.8-12.786 12.87-12.786 3.411 0 6.146 1.337 8.01 3.132l2.21-2.21C18.173 1.08 15.601 0 12.48 0 5.58 0 0 5.58 0 12.5s5.58 12.5 12.5 12.5c3.75 0 6.58-1.25 8.75-3.5 2.25-2.25 2.9-5.4 2.9-8 0-.6-.05-1.2-.15-1.75h-8.52Z" />
              </svg>
              {isLoading ? 'Connecting...' : 'Sign up with Google'}
            </button>

            {/* Login Link */}
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="font-semibold hover:underline transition-all text-foreground"
              >
                Log in
              </button>
            </p>
          </form>

          {/* Terms */}
          <div className="mt-12 pt-8 border-t border-border/50 text-center leading-loose text-[9px] uppercase tracking-widest text-muted-foreground">
            By continuing, you agree to the{' '}
            <a href="#" className="underline hover:text-foreground transition-colors">
              Terms of Service
            </a>{' '}
            <br /> and{' '}
            <a href="#" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </a>{' '}
            of EstateLedger.
          </div>
        </div>
      </section>
    </div>
  );
}
