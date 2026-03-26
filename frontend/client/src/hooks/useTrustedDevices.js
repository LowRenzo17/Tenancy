import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { createTrustedDevice, generateDeviceFingerprint, isTrustedDevice } from '../lib/deviceFingerprint';

/**
 * Custom Hook for Trusted Devices Management
 * Design System: The Architectural Ledger
 * - Manage trusted devices per user
 * - Add/remove trusted devices
 * - Check if current device is trusted
 */
export const useTrustedDevices = (userId) => {
  const [trustedDevices, setTrustedDevices] = useLocalStorage(`tenancy_trusted_devices_${userId}`, []);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);

  // Initialize current device ID on mount
  useEffect(() => {
    const deviceId = generateDeviceFingerprint();
    setCurrentDeviceId(deviceId);
  }, []);

  // Add a new trusted device
  const addTrustedDevice = () => {
    const newDevice = createTrustedDevice();
    setTrustedDevices([...trustedDevices, newDevice]);
    return newDevice;
  };

  // Remove a trusted device
  const removeTrustedDevice = (deviceId) => {
    setTrustedDevices(trustedDevices.filter(device => device.id !== deviceId));
  };

  // Revoke a trusted device (mark as inactive)
  const revokeTrustedDevice = (deviceId) => {
    setTrustedDevices(
      trustedDevices.map(device =>
        device.id === deviceId ? { ...device, isActive: false } : device
      )
    );
  };

  // Update last used timestamp for a device
  const updateDeviceLastUsed = (deviceId) => {
    setTrustedDevices(
      trustedDevices.map(device =>
        device.id === deviceId
          ? { ...device, lastUsed: new Date().toISOString() }
          : device
      )
    );
  };

  // Check if current device is trusted
  const isCurrentDeviceTrusted = () => {
    return isTrustedDevice(trustedDevices, currentDeviceId);
  };

  // Get all active trusted devices
  const getActiveTrustedDevices = () => {
    return trustedDevices.filter(device => device.isActive);
  };

  // Get device by ID
  const getDeviceById = (deviceId) => {
    return trustedDevices.find(device => device.id === deviceId);
  };

  // Clear all trusted devices
  const clearAllTrustedDevices = () => {
    setTrustedDevices([]);
  };

  return {
    trustedDevices,
    currentDeviceId,
    addTrustedDevice,
    removeTrustedDevice,
    revokeTrustedDevice,
    updateDeviceLastUsed,
    isCurrentDeviceTrusted,
    getActiveTrustedDevices,
    getDeviceById,
    clearAllTrustedDevices,
  };
};
