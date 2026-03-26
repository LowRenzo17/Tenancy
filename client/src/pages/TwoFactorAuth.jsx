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
            <Shield size={32} style={{ color: '#b6ebfe' }} />
            <h2
              className="text-3xl font-bold"
              style={{
                fontFamily: 'Manrope',
                color: '#fff',
              }}
            >
              Enhanced Security
            </h2>
          </div>
          <div className="w-24 h-1 mb-8" style={{ backgroundColor: '#b6ebfe' }} />
          <p
            className="text-lg font-medium"
            style={{ color: '#87bbce' }}
          >
            Two-factor authentication adds an extra layer of protection to your account. Verify your identity with a code from your phone.
          </p>
        </div>

        <div className="relative z-10">
          <p
            className="text-sm"
            style={{ color: '#87bbce' }}
          >
            ✓ Protects against unauthorized access<br />
            ✓ Works with authenticator apps<br />
            ✓ SMS backup codes available
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

          {/* Header */}
          <header className="mb-10">
            <h2
              className="text-3xl font-bold tracking-tight mb-2"
              style={{
                fontFamily: 'Manrope',
                color: '#071e27',
              }}
            >
              {showBackupCodes ? 'Save Your Backup Codes' : 'Verify Your Identity'}
            </h2>
            <p style={{ color: '#40484b' }}>
              {showBackupCodes
                ? 'Keep these codes in a safe place. You can use them if you lose access to your authenticator.'
                : `Enter the 6-digit code from your ${verificationMethod === 'sms' ? 'phone' : 'authenticator app'}`}
            </p>
          </header>

          {!showBackupCodes ? (
            <>
              {/* Verification Method Selection */}
              <div className="mb-8 space-y-3">
                <label style={{ color: '#40484b', fontSize: '0.875rem', fontWeight: '600' }}>
                  Verification Method
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setVerificationMethod('sms')}
                    className="w-full p-3 rounded-lg text-left transition-all"
                    style={{
                      backgroundColor: verificationMethod === 'sms' ? '#e6f6ff' : '#ffffff',
                      border: `1px solid ${verificationMethod === 'sms' ? '#003441' : '#d5ecf8'}`,
                      color: '#071e27',
                    }}
                  >
                    <p className="font-semibold text-sm">SMS to {email?.replace(/(.{2})(.*)(@.*)/, '$1***$3')}</p>
                    <p style={{ fontSize: '0.75rem', color: '#40484b' }}>Receive a code via text message</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationMethod('authenticator')}
                    className="w-full p-3 rounded-lg text-left transition-all"
                    style={{
                      backgroundColor: verificationMethod === 'authenticator' ? '#e6f6ff' : '#ffffff',
                      border: `1px solid ${verificationMethod === 'authenticator' ? '#003441' : '#d5ecf8'}`,
                      color: '#071e27',
                    }}
                  >
                    <p className="font-semibold text-sm">Authenticator App</p>
                    <p style={{ fontSize: '0.75rem', color: '#40484b' }}>Use Google Authenticator or similar</p>
                  </button>
                </div>
              </div>

              {/* OTP Input Form */}
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                  <label
                    className="block text-sm font-semibold"
                    style={{ color: '#40484b' }}
                  >
                    Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength="6"
                    className="w-full px-4 py-3 rounded-xl text-center text-2xl tracking-widest outline-none transition-all"
                    style={{
                      backgroundColor: '#ffffff',
                      border: `1px solid ${errors.otp ? '#ba1a1a' : '#d5ecf8'}`,
                      color: '#071e27',
                      fontFamily: 'monospace',
                    }}
                  />
                  {errors.otp && (
                    <p style={{ color: '#ba1a1a', fontSize: '0.75rem' }}>
                      {errors.otp}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl" style={{ backgroundColor: '#e6f6ff' }}>
                  <input
                    type="checkbox"
                    id="trust-device"
                    checked={trustDevice}
                    onChange={(e) => setTrustDevice(e.target.checked)}
                    className="w-5 h-5 cursor-pointer"
                    style={{ accentColor: '#003441' }}
                  />
                  <label
                    htmlFor="trust-device"
                    className="flex-1 cursor-pointer text-sm font-medium"
                    style={{ color: '#003441' }}
                  >
                    Trust this device for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
                    fontFamily: 'Manrope',
                  }}
                >
                  <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
                  <ArrowRight size={20} />
                </button>

                <button
                  type="button"
                  onClick={onSkip}
                  className="w-full py-3 px-6 font-semibold rounded-xl transition-all"
                  style={{
                    backgroundColor: '#e6f6ff',
                    color: '#003441',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d5ecf8')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
                >
                  Skip for Now
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Backup Codes Display */}
              <div className="space-y-4">
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
                    ⚠️ Save these codes in a secure location. Each code can only be used once.
                  </p>
                </div>

                <div
                  className="p-4 rounded-lg space-y-2"
                  style={{
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                  }}
                >
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e0f2fe',
                      }}
                    >
                      <code
                        style={{
                          fontFamily: 'monospace',
                          color: '#003441',
                          fontWeight: '600',
                        }}
                      >
                        {code}
                      </code>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(code)}
                        className="text-xs px-2 py-1 rounded transition-all"
                        style={{
                          backgroundColor: '#e6f6ff',
                          color: '#003441',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d5ecf8')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e6f6ff')}
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
                  className="w-full py-4 px-6 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
                    fontFamily: 'Manrope',
                  }}
                >
                  I've Saved My Codes
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
