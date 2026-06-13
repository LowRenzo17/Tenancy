import { useState } from 'react';
import { Trash2, Shield, Smartphone, Monitor, Tablet, MapPin, Clock } from 'lucide-react';
import Card from '../components/Card';
import { useTrustedDevices } from '../hooks/useTrustedDevices';

/**
 * Trusted Devices Management Page
 * Design System: The Architectural Ledger
 * - View all trusted devices
 * - Revoke device access
 * - Device details and last used info
 */
export default function TrustedDevices({ currentUser }) {
  const { trustedDevices, revokeTrustedDevice, getActiveTrustedDevices } = useTrustedDevices(currentUser?.email);
  const [revokeConfirm, setRevokeConfirm] = useState(null);

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'Mobile':
        return <Smartphone size={24} />;
      case 'Tablet':
        return <Tablet size={24} />;
      default:
        return <Monitor size={24} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  };

  const handleRevoke = (deviceId) => {
    revokeTrustedDevice(deviceId);
    setRevokeConfirm(null);
  };

  const activeTrustedDevices = getActiveTrustedDevices();

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
            Trusted Devices
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage devices that have been verified with two-factor authentication.
          </p>
        </div>
      </div>

        {/* Security Info */}
        <Card variant="subtle" className="p-6 bg-secondary/30 mt-8 border-l-4 border-l-[#003441] mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#003441]/10 flex items-center justify-center shrink-0">
               <Shield size={20} className="text-[#003441]" />
            </div>
            <div>
              <p className="font-bold text-foreground">Device Trust Security</p>
              <p className="text-sm font-medium text-muted-foreground mt-1">Trusted devices won't require 2FA for 30 days. You can revoke access anytime. If you don't recognize a device, revoke it immediately.</p>
            </div>
          </div>
        </Card>

        {/* Devices List */}
        <div className="space-y-6">
          {activeTrustedDevices.length === 0 ? (
            <Card variant="elevated" className="p-16 text-center bg-white border border-border flex flex-col justify-center items-center">
              <Smartphone size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-lg font-bold tracking-tight text-foreground">No trusted devices yet</p>
              <p className="text-sm font-medium text-muted-foreground mt-2 max-w-sm">
                 Devices will appear here after you verify with 2FA and choose to trust them.
              </p>
            </Card>
          ) : (
            activeTrustedDevices.map((device) => (
              <Card
                key={device.id}
                variant="elevated"
                className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white border-t-2 border-t-slate-800"
              >
                <div className="flex items-start md:items-center space-x-6 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    {getDeviceIcon(device.deviceType)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold tracking-tight text-foreground">
                      {device.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                       <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>
                          {device.os} • {device.browser}
                       </p>
                       <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                         <MapPin size={14} className="opacity-70" /> {device.location}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 self-stretch md:self-auto min-w-[200px] border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                  <div className="w-full text-left md:text-right text-xs font-semibold text-muted-foreground space-y-1">
                     <p><Clock size={12} className="inline mr-1 mb-0.5 opacity-70"/> Last used: {formatDate(device.lastUsed)}</p>
                     <p className="text-[#003441]">Trusted on: {formatDate(device.trustedAt)}</p>
                  </div>
                  
                  {revokeConfirm === device.id ? (
                    <div className="flex items-center space-x-2 mt-auto text-right w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleRevoke(device.id)}
                        className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all bg-[#ba1a1a] text-white hover:bg-[#ba1a1a]/90"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setRevokeConfirm(null)}
                        className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all border border-border text-foreground hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRevokeConfirm(device.id)}
                      className="px-4 py-2 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-all bg-white border border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-[#ba1a1a]/5 mt-auto flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Revoke Access
                    </button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Revoked Devices */}
        {trustedDevices.filter(d => !d.isActive).length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
              Revoked Devices
            </h2>
            <div className="space-y-3">
              {trustedDevices
                .filter(d => !d.isActive)
                .map((device) => (
                  <Card
                    key={device.id}
                    variant="subtle"
                    className="p-4 bg-slate-50 border border-slate-100 opacity-70 grayscale"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">
                          {getDeviceIcon(device.deviceType)}
                        </div>
                        <p className="font-bold text-slate-500">
                          {device.name}
                        </p>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#ba1a1a]/70">
                        Revoked on {formatDate(device.trustedAt)}
                      </p>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
    </div>
  );
}
