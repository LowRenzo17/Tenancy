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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleRevoke = (deviceId) => {
    revokeTrustedDevice(deviceId);
    setRevokeConfirm(null);
  };

  const activeTrustedDevices = getActiveTrustedDevices();

  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: '#f3faff' }}>
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: 'Manrope',
              color: '#003441',
            }}
          >
            Trusted Devices
          </h1>
          <p style={{ color: '#70787c' }}>
            Manage devices that have been verified with two-factor authentication
          </p>
        </div>

        {/* Security Info */}
        <Card className="mb-8 p-6 flex items-start space-x-4" style={{ backgroundColor: '#e6f6ff', border: 'none' }}>
          <Shield size={24} style={{ color: '#003441', flexShrink: 0 }} />
          <div>
            <h3
              className="font-semibold mb-2"
              style={{ color: '#003441' }}
            >
              Device Trust Security
            </h3>
            <p style={{ color: '#40484b', fontSize: '0.875rem' }}>
              Trusted devices won't require 2FA for 30 days. You can revoke access anytime. If you don't recognize a device, revoke it immediately.
            </p>
          </div>
        </Card>

        {/* Devices List */}
        <div className="space-y-4">
          {activeTrustedDevices.length === 0 ? (
            <Card className="p-8 text-center" style={{ backgroundColor: '#ffffff' }}>
              <Smartphone size={48} className="mx-auto mb-4" style={{ color: '#b0bcc4' }} />
              <p style={{ color: '#70787c' }}>
                No trusted devices yet. Devices will appear here after you verify with 2FA and choose to trust them.
              </p>
            </Card>
          ) : (
            activeTrustedDevices.map((device) => (
              <Card
                key={device.id}
                className="p-6 flex items-start justify-between hover:shadow-md transition-shadow"
                style={{ backgroundColor: '#ffffff' }}
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: '#e6f6ff' }}
                  >
                    {getDeviceIcon(device.deviceType)}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-semibold mb-2"
                      style={{ color: '#003441' }}
                    >
                      {device.name}
                    </h3>
                    <div className="space-y-1 text-sm" style={{ color: '#70787c' }}>
                      <div className="flex items-center space-x-2">
                        <span>{device.os}</span>
                        <span>•</span>
                        <span>{device.browser}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin size={14} />
                        <span>{device.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={14} />
                        <span>
                          Last used: {formatDate(device.lastUsed)} at {formatTime(device.lastUsed)}
                        </span>
                      </div>
                      <div style={{ color: '#0f4c5c' }}>
                        Trusted on: {formatDate(device.trustedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  {revokeConfirm === device.id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRevoke(device.id)}
                        className="px-3 py-2 text-xs font-semibold rounded-lg text-white"
                        style={{ backgroundColor: '#ba1a1a' }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setRevokeConfirm(null)}
                        className="px-3 py-2 text-xs font-semibold rounded-lg"
                        style={{ backgroundColor: '#d5ecf8', color: '#003441' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRevokeConfirm(device.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      style={{ color: '#ba1a1a' }}
                      title="Revoke device access"
                    >
                      <Trash2 size={20} />
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
            <h2
              className="text-xl font-semibold mb-4"
              style={{
                fontFamily: 'Manrope',
                color: '#003441',
              }}
            >
              Revoked Devices
            </h2>
            <div className="space-y-3">
              {trustedDevices
                .filter(d => !d.isActive)
                .map((device) => (
                  <Card
                    key={device.id}
                    className="p-4"
                    style={{ backgroundColor: '#f5f5f5', opacity: 0.6 }}
                  >
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.deviceType)}
                      <div className="flex-1">
                        <p style={{ color: '#70787c' }}>
                          {device.name}
                        </p>
                      </div>
                      <p style={{ color: '#b0bcc4', fontSize: '0.875rem' }}>
                        Revoked on {formatDate(device.trustedAt)}
                      </p>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
