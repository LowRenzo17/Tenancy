import { useState, useEffect } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

/**
 * Session Timeout Warning Modal
 * Design System: The Architectural Ledger
 * - Displays warning before session expires
 * - Allows user to extend session or logout
 */
export default function SessionTimeoutWarning({ isVisible, timeRemaining, onExtend, onLogout }) {
  const [displayTime, setDisplayTime] = useState(timeRemaining);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDisplayTime(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        style={{ backgroundColor: '#f3faff' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: '#fef3c7' }}
          >
            <AlertCircle size={24} style={{ color: '#92400e' }} />
          </div>
          <div>
            <h3
              className="font-bold text-lg"
              style={{
                fontFamily: 'Manrope',
                color: '#071e27',
              }}
            >
              Session Expiring
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#40484b' }}>
              Your session will expire soon
            </p>
          </div>
        </div>

        {/* Timer Display */}
        <div
          className="p-6 rounded-xl mb-6 flex items-center justify-center gap-3"
          style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}
        >
          <Clock size={20} style={{ color: '#856404' }} />
          <div className="text-center">
            <p style={{ fontSize: '0.875rem', color: '#856404' }}>Time remaining</p>
            <p
              className="text-3xl font-bold"
              style={{
                fontFamily: 'monospace',
                color: '#856404',
              }}
            >
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Message */}
        <p
          className="mb-6 text-center"
          style={{ color: '#40484b', fontSize: '0.875rem' }}
        >
          You've been inactive for a while. Your session will expire for security reasons. Would you like to stay logged in?
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all"
            style={{
              backgroundColor: '#ffdad6',
              color: '#ba1a1a',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffccc4')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffdad6')}
          >
            Log Out
          </button>
          <button
            onClick={onExtend}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-white"
            style={{
              background: 'linear-gradient(135deg, #003441 0%, #0f4c5c 100%)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Stay Logged In
          </button>
        </div>

        {/* Footer */}
        <p
          className="text-center mt-4 text-xs"
          style={{ color: '#70787c' }}
        >
          Your session is protected by encryption. <a href="#" style={{ color: '#003441', fontWeight: '600' }}>Learn more</a>
        </p>
      </div>
    </div>
  );
}
