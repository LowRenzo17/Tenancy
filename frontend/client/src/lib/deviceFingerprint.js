/**
 * Device Fingerprinting Utility
 * Design System: The Architectural Ledger
 * - Generate unique device identifiers based on browser and OS info
 * - Create device names for user-friendly display
 */

export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  
  // Detect OS
  let os = 'Unknown';
  if (userAgent.indexOf('Win') > -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') > -1) os = 'macOS';
  else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
  else if (userAgent.indexOf('Android') > -1) os = 'Android';
  else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) os = 'iOS';
  
  // Detect browser
  let browser = 'Unknown';
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Chromium') === -1) browser = 'Chrome';
  else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) browser = 'Safari';
  else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';
  else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) browser = 'Internet Explorer';
  
  // Detect device type
  let deviceType = 'Desktop';
  if (userAgent.indexOf('Mobile') > -1 || userAgent.indexOf('Android') > -1) deviceType = 'Mobile';
  else if (userAgent.indexOf('iPad') > -1 || userAgent.indexOf('Tablet') > -1) deviceType = 'Tablet';
  
  return {
    os,
    browser,
    deviceType,
    userAgent,
  };
};

// Generate a simple hash for device fingerprint
export const generateDeviceFingerprint = () => {
  const deviceInfo = getDeviceInfo();
  const timestamp = new Date().getTime();
  const randomId = Math.random().toString(36).substring(2, 15);
  
  // Create a simple hash from device info
  const fingerprint = `${deviceInfo.os}-${deviceInfo.browser}-${deviceInfo.deviceType}-${randomId}`;
  return fingerprint;
};

// Create a human-readable device name
export const generateDeviceName = () => {
  const deviceInfo = getDeviceInfo();
  const timestamp = new Date();
  const date = timestamp.toLocaleDateString();
  
  return `${deviceInfo.browser} on ${deviceInfo.os} (${date})`;
};

// Get device location (simulated - in production, use IP geolocation)
export const getDeviceLocation = () => {
  // Simulated location - in production, use IP geolocation API
  const locations = [
    'New York, NY',
    'San Francisco, CA',
    'London, UK',
    'Tokyo, Japan',
    'Sydney, Australia',
  ];
  return locations[Math.floor(Math.random() * locations.length)];
};

// Create a trusted device object
export const createTrustedDevice = () => {
  const deviceInfo = getDeviceInfo();
  
  return {
    id: generateDeviceFingerprint(),
    name: generateDeviceName(),
    os: deviceInfo.os,
    browser: deviceInfo.browser,
    deviceType: deviceInfo.deviceType,
    location: getDeviceLocation(),
    trustedAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    isActive: true,
  };
};

// Check if a device is trusted
export const isTrustedDevice = (trustedDevices, currentDeviceId) => {
  if (!trustedDevices || trustedDevices.length === 0) return false;
  return trustedDevices.some(device => device.id === currentDeviceId && device.isActive);
};
