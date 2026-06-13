import { useState, useEffect } from 'react';
import apiClient from '../lib/api';
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
  const [loginHistory, setLoginHistory] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState({ suspicious: false });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/auth/login-history');
        if (response.success && response.loginHistory) {
          setLoginHistory(response.loginHistory);
          
          // Detect suspicious activity
          const recentFailures = response.loginHistory.filter(r => r.status !== 'success').slice(0, 5);
          if (recentFailures.length >= 3) {
            setSuspiciousActivity({
              suspicious: true,
              failedAttempts: recentFailures.length
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch login history', err);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-KE', {
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

  const recentLogins = loginHistory.filter(record => {
    const recordDate = new Date(record.timestamp);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    return recordDate > cutoffDate && record.status === 'success';
  });

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Login History & Activity
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor your account access and security events.
          </p>
        </div>
      </div>

      {/* Security Alert */}
      {suspiciousActivity?.suspicious && (
        <Card variant="elevated" className="p-0 overflow-hidden border border-[#f59e0b]/30">
          <div className="p-6 border-l-4 border-l-[#f59e0b] bg-[#fef3c7]/50 flex items-start gap-4">
            <div className="text-[#92400e] bg-[#f59e0b]/20 p-2 rounded-lg shrink-0 mt-0.5 animate-pulse">
              ⚠️
            </div>
            <div>
              <p className="font-bold tracking-tight text-[#92400e] text-lg mb-1">
                Suspicious Activity Detected
              </p>
              <p className="text-sm font-medium text-[#92400e]/80">
                {suspiciousActivity.failedAttempts} failed login attempts detected. If this wasn't you, please change your password immediately.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Session Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6 bg-white border-t-4 border-t-slate-800">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <LogOut size={20} className="text-muted-foreground" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Total Logins <span className="lowercase">(7 days)</span></p>
            <p className="text-3xl font-black tracking-tight text-slate-800">
              {recentLogins.length}
            </p>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 bg-white border-t-4 border-t-emerald-600">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-700" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Current Session</p>
            <p className="text-3xl font-black tracking-tight text-emerald-800">
              Active
            </p>
          </div>
        </Card>

        <Card variant="elevated" className="p-6 bg-white border-t-4 border-t-[#ba1a1a]">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle size={20} className="text-red-700" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Failed Attempts</p>
            <p className="text-3xl font-black tracking-tight text-[#ba1a1a]">
              {loginHistory.filter(l => l.status !== 'success').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Login History Table */}
      <Card variant="elevated" className="p-0 overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Recent Login Activity
          </h3>
        </div>

        {loginHistory.length === 0 ? (
          <div className="p-16 text-center bg-white">
            <Clock size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-lg font-bold tracking-tight text-foreground">No login history available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/40 border-b border-border">
                <tr>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Date & Time</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Method</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Status</th>
                  <th className="py-4 px-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Device Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...loginHistory].reverse().map((record, index) => (
                  <tr
                    key={index}
                    className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'} hover:bg-secondary/40`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-muted-foreground" />
                        <span className="font-bold text-foreground">
                          {formatDate(record.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-foreground">
                      <span className="px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-700">
                        {getMethodLabel(record.method)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {record.status === 'success' ? (
                          <>
                            <CheckCircle size={16} className="text-emerald-600" />
                            <span className="text-sm font-bold text-emerald-700 uppercase tracking-widest">
                              Success
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="text-[#ba1a1a]" />
                            <span className="text-sm font-bold text-[#ba1a1a] uppercase tracking-widest">
                              Failed
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <MapPin size={14} className="opacity-70" />
                        <span>{record.deviceInfo?.split(' ').slice(-2).join(' ') || record.ipAddress || 'Unknown'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Security Tips */}
      <Card variant="subtle" className="p-6 bg-secondary/30 mt-8 border-l-4 border-l-[#003441]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">
          Security Tips
        </h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-4">
            <div className="bg-[#003441]/10 p-1 rounded mt-0.5">
              <CheckCircle size={14} className="text-[#003441]" />
            </div>
            <span className="font-medium text-foreground">Enable two-factor authentication for enhanced security.</span>
          </li>
          <li className="flex gap-4">
            <div className="bg-[#003441]/10 p-1 rounded mt-0.5">
              <CheckCircle size={14} className="text-[#003441]" />
            </div>
            <span className="font-medium text-foreground">Review this page regularly to monitor account access.</span>
          </li>
          <li className="flex gap-4">
            <div className="bg-[#003441]/10 p-1 rounded mt-0.5">
              <CheckCircle size={14} className="text-[#003441]" />
            </div>
            <span className="font-medium text-foreground">Log out from all devices if you notice unauthorized access.</span>
          </li>
          <li className="flex gap-4">
            <div className="bg-[#003441]/10 p-1 rounded mt-0.5">
              <CheckCircle size={14} className="text-[#003441]" />
            </div>
            <span className="font-medium text-foreground">Use a strong, unique password and change it regularly.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
