import { useState } from 'react';
import { Building2, Users, Wallet, ShieldCheck } from 'lucide-react';
import { useLocation } from 'wouter';
import SEO from '../components/SEO';

/**
 * Signup Page Component
 * Design System: The Architectural Ledger
 * - Professional signup form with account type selection
 * - Property Owner vs Tenant account types
 */
export default function Signup({ onSignup, onLoginClick }) {
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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number, and special symbol';
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
