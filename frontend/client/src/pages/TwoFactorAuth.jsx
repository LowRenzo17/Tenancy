import { useState } from 'react';
import { ArrowRight, Shield } from 'lucide-react';

/**
 * Two-Factor Authentication Page
 * Design System: The Architectural Ledger
 * - OTP verification form
 * - SMS/Authenticator app options
 * - Backup codes display
 */
export default function TwoFactorAuth({ onVerify, onSkip, email, onTrustDevice }) {
  const [verificationMethod, setVerificationMethod] = useState('sms');
  const [otp, setOtp] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [trustDevice, setTrustDevice] = useState(false);

  // Generate mock backup codes
  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      codes.push(`${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}`);
    }
    return codes;
  };

  const backupCodes = generateBackupCodes();

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const validateOtp = () => {
    const newErrors = {};
    if (!otp || otp.length !== 6) {
      newErrors.otp = 'Please enter a valid 6-digit code';
    }
    return newErrors;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const newErrors = validateOtp();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    // Simulate verification
    setTimeout(() => {
      if (trustDevice && onTrustDevice) {
        onTrustDevice();
      }
      onVerify({
        method: verificationMethod,
        backupCodes,
        otp,
        trustDevice,
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Side */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-16 bg-slate-900">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Tenancy Slate
          </h1>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={32} className="text-[#b6ebfe]" />
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Enhanced Security
            </h2>
          </div>
          <div className="w-24 h-1 mb-8 bg-[#b6ebfe]" />
          <p className="text-lg font-medium text-slate-300">
            Two-factor authentication adds an extra layer of protection to your account. Verify your identity with a code from your phone.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-sm font-medium text-slate-400 space-y-2">
            <span className="block">✓ Protects against unauthorized access</span>
            <span className="block">✓ Works with authenticator apps</span>
            <span className="block">✓ SMS backup codes available</span>
          </p>
        </div>
      </section>

      {/* Right Side */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Tenancy Slate
            </h2>
          </div>

          {/* Header */}
          <header className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              {showBackupCodes ? 'Save Your Backup Codes' : 'Verify Your Identity'}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              {showBackupCodes
                ? 'Keep these codes in a safe place. You can use them if you lose access to your authenticator.'
                : `Enter the 6-digit code from your ${verificationMethod === 'sms' ? 'phone' : 'authenticator app'}`}
            </p>
          </header>

          {!showBackupCodes ? (
            <>
              {/* Verification Method Selection */}
              <div className="mb-8 space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Verification Method
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setVerificationMethod('sms')}
                    className={`w-full p-4 rounded-xl text-left transition-all border ${verificationMethod === 'sms' ? 'bg-slate-50 border-slate-900' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  >
                    <p className="font-bold tracking-tight text-slate-900">SMS to {email?.replace(/(.{2})(.*)(@.*)/, 'Ksh 1***Ksh 3')}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Receive a code via text message</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationMethod('authenticator')}
                    className={`w-full p-4 rounded-xl text-left transition-all border ${verificationMethod === 'authenticator' ? 'bg-slate-50 border-slate-900' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  >
                    <p className="font-bold tracking-tight text-slate-900">Authenticator App</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Use Google Authenticator or similar</p>
                  </button>
                </div>
              </div>

              {/* OTP Input Form */}
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength="6"
                    className={`w-full px-4 py-4 rounded-xl text-center text-3xl font-black tracking-[1em] outline-none transition-all block bg-slate-50 border ${errors.otp ? 'border-[#ba1a1a]' : 'border-slate-200 focus:border-slate-900'} text-slate-900 font-mono pl-8`}
                  />
                  {errors.otp && (
                    <p className="text-xs font-bold text-[#ba1a1a] mt-2">
                      {errors.otp}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <input
                    type="checkbox"
                    id="trust-device"
                    checked={trustDevice}
                    onChange={(e) => setTrustDevice(e.target.checked)}
                    className="w-5 h-5 cursor-pointer accent-slate-900 rounded border-slate-300 focus:ring-slate-900"
                  />
                  <label
                    htmlFor="trust-device"
                    className="flex-1 cursor-pointer text-sm font-bold text-slate-700"
                  >
                    Trust this device for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 text-white text-[10px] uppercase font-bold tracking-widest rounded-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 bg-slate-900 hover:bg-slate-800"
                >
                  <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={onSkip}
                  className="w-full py-3 px-6 text-[10px] uppercase font-bold tracking-widest rounded-xl transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Skip for Now
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Backup Codes Display */}
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[#fef3c7]/50 border border-[#f59e0b]/30">
                  <p className="text-sm font-bold text-[#92400e]">
                    ⚠️ Save these codes in a secure location. Each code can only be used once.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded border border-slate-200 bg-white"
                    >
                      <code className="font-mono text-sm font-bold text-slate-800">
                        {code}
                      </code>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(code)}
                        className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onVerify({
                      method: verificationMethod,
                      backupCodes,
                      otp,
                      codesAcknowledged: true,
                    });
                  }}
                  className="w-full py-4 px-6 text-white text-[10px] uppercase font-bold tracking-widest rounded-xl transition-all active:scale-[0.98] bg-slate-900 hover:bg-slate-800"
                >
                  I've Saved My Codes
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs font-semibold text-slate-500">
              Need help? <a href="#" className="text-slate-900 hover:underline">Contact support</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
