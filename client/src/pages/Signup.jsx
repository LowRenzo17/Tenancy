import { useState } from 'react';
import { Building2, Users } from 'lucide-react';

/**
 * Signup Page Component
 * Design System: The Architectural Ledger
 * - Professional signup form with account type selection
 * - Property Owner vs Tenant account types
 */
export default function Signup({ onSignup }) {
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
      onSignup({
        id: Math.random().toString(36).substr(2, 9),
        name: formData.fullName,
        email: formData.email,
        accountType: formData.accountType,
        createdAt: new Date(),
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side: Brand & Visuals */}
      <section
        className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" style={{ color: '#d5ecf8' }} />
          </svg>
        </div>

        {/* Top Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#fff' }}
            >
              <Building2 size={28} style={{ color: '#003441' }} />
            </div>
            <span
              className="text-2xl font-extrabold tracking-tight"
              style={{
                fontFamily: 'Manrope',
                color: '#fff',
              }}
            >
              Tenancy Slate
            </span>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="relative z-10 max-w-lg">
          <h1
            className="text-5xl font-extrabold leading-tight mb-8 tracking-tight"
            style={{
              fontFamily: 'Manrope',
              color: '#fff',
            }}
          >
            Manage your assets <br />
            <span style={{ color: '#b6ebfe' }}>with precision.</span>
          </h1>

          <div className="space-y-8">
            {/* Feature 1 */}
            <div className="flex gap-4 items-start">
              <div
                className="p-3 rounded-xl text-primary flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(16px)',
                  color: '#003441',
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3
                  className="text-lg font-bold mb-1"
                  style={{
                    fontFamily: 'Manrope',
                    color: '#fff',
                  }}
                >
                  Architectural Clarity
                </h3>
                <p style={{ color: '#87bbce', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  View your entire portfolio through a curated lens. Every contract, every detail, organized with editorial care.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4 items-start">
              <div
                className="p-3 rounded-xl text-primary flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(16px)',
                  color: '#003441',
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3
                  className="text-lg font-bold mb-1"
                  style={{
                    fontFamily: 'Manrope',
                    color: '#fff',
                  }}
                >
                  Seamless Cash Flow
                </h3>
                <p style={{ color: '#87bbce', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  Automated rent collection and expense tracking designed to move with the rhythm of your business.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div
          className="relative z-10 p-6 rounded-2xl max-w-md"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p
            className="italic text-sm mb-4"
            style={{
              color: '#40484b',
              fontStyle: 'italic',
            }}
          >
            "Tenancy Slate transformed our property management from a chaotic spreadsheet into a high-end digital office experience."
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
              }}
            />
            <div>
              <p
                className="font-bold text-xs uppercase tracking-widest"
                style={{ color: '#003441' }}
              >
                Marcus Thorne
              </p>
              <p style={{ color: '#40484b', fontSize: '0.625rem' }}>
                Principal, Thorne Estates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Registration Form */}
      <section className="flex-1 flex flex-col justify-center bg-white p-8 md:p-24 relative">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2 mb-12">
            <Building2 size={32} style={{ color: '#003441' }} />
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{
                fontFamily: 'Manrope',
                color: '#003441',
              }}
            >
              Tenancy Slate
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-10">
            <h2
              className="text-3xl font-extrabold tracking-tight mb-2"
              style={{
                fontFamily: 'Manrope',
                color: '#071e27',
              }}
            >
              Create your account
            </h2>
            <p style={{ color: '#40484b' }}>Join the elite network of property management.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="group">
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2 px-1"
                style={{ color: '#40484b' }}
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Jonathan Sterling"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 rounded-lg text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d5ecf8',
                    color: '#071e27',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#003441')}
                  onBlur={(e) => (e.target.style.borderColor = '#d5ecf8')}
                />
                {errors.fullName && (
                  <p style={{ color: '#ba1a1a', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.fullName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2 px-1"
                style={{ color: '#40484b' }}
              >
                Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="j.sterling@estate.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 rounded-lg text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d5ecf8',
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

            {/* Password */}
            <div className="group">
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2 px-1"
                style={{ color: '#40484b' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 rounded-lg text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d5ecf8',
                    color: '#071e27',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#003441')}
                  onBlur={(e) => (e.target.style.borderColor = '#d5ecf8')}
                />
                {errors.password && (
                  <p style={{ color: '#ba1a1a', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Account Type Selector */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-3 px-1"
                style={{ color: '#40484b' }}
              >
                I am a
              </label>
              <div className="grid grid-cols-2 gap-4">
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
                    className="p-4 rounded-xl text-center flex flex-col items-center gap-2 transition-all border-2"
                    style={{
                      backgroundColor: formData.accountType === 'owner' ? '#e6f6ff' : '#ffffff',
                      borderColor: formData.accountType === 'owner' ? '#003441' : '#d5ecf8',
                    }}
                    onMouseEnter={(e) => {
                      if (formData.accountType !== 'owner') {
                        e.currentTarget.style.backgroundColor = '#f3faff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.accountType !== 'owner') {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    <Building2 size={24} style={{ color: '#003441' }} />
                    <span
                      className="text-sm font-bold"
                      style={{ color: '#071e27' }}
                    >
                      Property Owner
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
                    className="p-4 rounded-xl text-center flex flex-col items-center gap-2 transition-all border-2"
                    style={{
                      backgroundColor: formData.accountType === 'tenant' ? '#e6f6ff' : '#ffffff',
                      borderColor: formData.accountType === 'tenant' ? '#003441' : '#d5ecf8',
                    }}
                    onMouseEnter={(e) => {
                      if (formData.accountType !== 'tenant') {
                        e.currentTarget.style.backgroundColor = '#f3faff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.accountType !== 'tenant') {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    <Users size={24} style={{ color: '#003441' }} />
                    <span
                      className="text-sm font-bold"
                      style={{ color: '#071e27' }}
                    >
                      Tenant
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
                className="w-full text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] focus:ring-4 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
                  fontFamily: 'Manrope',
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm" style={{ color: '#40484b' }}>
              Already have an account?{' '}
              <a
                href="#"
                className="font-bold hover:underline underline-offset-4 transition-all"
                style={{ color: '#003441' }}
              >
                Log in
              </a>
            </p>
          </form>

          {/* Terms */}
          <div
            className="mt-12 pt-8 border-t text-center leading-loose"
            style={{
              borderColor: 'rgba(112, 120, 124, 0.1)',
              color: '#40484b',
              fontSize: '0.625rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            By continuing, you agree to the{' '}
            <a href="#" className="underline">
              Terms of Service
            </a>{' '}
            <br /> and{' '}
            <a href="#" className="underline">
              Privacy Policy
            </a>{' '}
            of Tenancy Slate.
          </div>
        </div>
      </section>
    </div>
  );
}
