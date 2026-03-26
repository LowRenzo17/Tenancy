import { useState, useEffect } from 'react';
import { useLoginHistory } from '../hooks/useSessionTracker';
import Card from '../components/Card';
import { LogOut, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';

/**
 * Login History Page
 * Design System: The Architectural Ledger
 * - Display user login history
 * - Show session activity
 * - Detect suspicious activity
 */
export default function LoginHistory() {
  const { getLoginHistory, getRecentLogins, detectSuspiciousActivity } = useLoginHistory();
  const [loginHistory, setLoginHistory] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState(null);

  useEffect(() => {
    setLoginHistory(getLoginHistory());
    setSuspiciousActivity(detectSuspiciousActivity());
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodLabel = (method) => {
    const methods = {
      email: '📧 Email & Password',
      google: '🔵 Google',
      github: '⚫ GitHub',
      sms: '📱 SMS 2FA',
      authenticator: '🔐 Authenticator',
    };
    return methods[method] || method;
  };

  const recentLogins = getRecentLogins(7);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{
            fontFamily: 'Manrope',
            color: '#071e27',
          }}
        >
          Login History & Activity
        </h1>
        <p style={{ color: '#40484b' }}>
          Monitor your account access and security events
        </p>
      </div>

      {/* Security Alert */}
      {suspiciousActivity?.suspicious && (
        <Card>
          <div
            className="p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: '#fef3c7',
              borderColor: '#f59e0b',
            }}
          >
            <div className="flex items-start gap-3">
              <div style={{ color: '#92400e', marginTop: '2px' }}>⚠️</div>
              <div>
                <p
                  className="font-semibold"
                  style={{ color: '#92400e' }}
                >
                  Suspicious Activity Detected
                </p>
                <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
                  {suspiciousActivity.failedAttempts} failed login attempts detected. If this wasn't you, please change your password immediately.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Session Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#40484b', fontSize: '0.875rem' }}>Total Logins (7 days)</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{
                  fontFamily: 'Manrope',
                  color: '#003441',
                }}
              >
                {recentLogins.length}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#e6f6ff' }}
            >
              <LogOut size={24} style={{ color: '#003441' }} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#40484b', fontSize: '0.875rem' }}>Current Session</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{
                  fontFamily: 'Manrope',
                  color: '#003441',
                }}
              >
                Active
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#dcfce7' }}
            >
              <CheckCircle size={24} style={{ color: '#16a34a' }} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#40484b', fontSize: '0.875rem' }}>Failed Attempts</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{
                  fontFamily: 'Manrope',
                  color: '#003441',
                }}
              >
                {loginHistory.filter(l => !l.success).length}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#fee2e2' }}
            >
              <XCircle size={24} style={{ color: '#dc2626' }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Login History Table */}
      <Card>
        <div>
          <h2
            className="text-xl font-bold mb-4"
            style={{
              fontFamily: 'Manrope',
              color: '#071e27',
            }}
          >
            Recent Login Activity
          </h2>

          {loginHistory.length === 0 ? (
            <p style={{ color: '#40484b', textAlign: 'center', padding: '2rem' }}>
              No login history available
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #d5ecf8' }}>
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{ color: '#40484b' }}
                    >
                      Date & Time
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{ color: '#40484b' }}
                    >
                      Method
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{ color: '#40484b' }}
                    >
                      Status
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold"
                      style={{ color: '#40484b' }}
                    >
                      Device Info
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...loginHistory].reverse().map((record, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid #e6f6ff',
                        backgroundColor: index % 2 === 0 ? 'transparent' : '#f9fcff',
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Clock size={16} style={{ color: '#70787c' }} />
                          <span style={{ color: '#071e27' }}>
                            {formatDate(record.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span style={{ color: '#071e27' }}>
                          {getMethodLabel(record.method)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {record.success ? (
                            <>
                              <CheckCircle size={16} style={{ color: '#16a34a' }} />
                              <span style={{ color: '#16a34a', fontWeight: '500' }}>
                                Success
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} style={{ color: '#dc2626' }} />
                              <span style={{ color: '#dc2626', fontWeight: '500' }}>
                                Failed
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#40484b' }}>
                          <MapPin size={14} />
                          <span>{record.userAgent?.split(' ').slice(-2).join(' ') || 'Unknown'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Security Tips */}
      <Card>
        <h2
          className="text-xl font-bold mb-4"
          style={{
            fontFamily: 'Manrope',
            color: '#071e27',
          }}
        >
          Security Tips
        </h2>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span style={{ color: '#003441' }}>✓</span>
            <span style={{ color: '#40484b' }}>
              Enable two-factor authentication for enhanced security
            </span>
          </li>
          <li className="flex gap-3">
            <span style={{ color: '#003441' }}>✓</span>
            <span style={{ color: '#40484b' }}>
              Review this page regularly to monitor account access
            </span>
          </li>
          <li className="flex gap-3">
            <span style={{ color: '#003441' }}>✓</span>
            <span style={{ color: '#40484b' }}>
              Log out from all devices if you notice unauthorized access
            </span>
          </li>
          <li className="flex gap-3">
            <span style={{ color: '#003441' }}>✓</span>
            <span style={{ color: '#40484b' }}>
              Use a strong, unique password and change it regularly
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
