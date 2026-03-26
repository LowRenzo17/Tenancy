import { useEffect, useRef } from 'react';

/**
 * Session Activity Tracker Hook
 * Monitors user activity and manages session timeout
 * Tracks: clicks, keyboard input, mouse movement, scroll
 */
export function useSessionTracker(options = {}) {
  const {
    inactivityTimeout = 15 * 60 * 1000, // 15 minutes default
    onTimeout = () => {},
    onActivity = () => {},
  } = options;

  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    lastActivityRef.current = Date.now();
    onActivity?.({
      lastActivity: lastActivityRef.current,
      sessionDuration: Date.now() - sessionStartRef.current,
    });

    timeoutRef.current = setTimeout(() => {
      onTimeout?.({
        lastActivity: lastActivityRef.current,
        sessionDuration: Date.now() - sessionStartRef.current,
        reason: 'inactivity',
      });
    }, inactivityTimeout);
  };

  useEffect(() => {
    // Initialize timeout
    resetTimeout();

    // Activity listeners
    const handleActivity = () => {
      resetTimeout();
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, true);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity, true);
      });
    };
  }, [inactivityTimeout]);

  return {
    getSessionInfo: () => ({
      lastActivity: lastActivityRef.current,
      sessionStart: sessionStartRef.current,
      sessionDuration: Date.now() - sessionStartRef.current,
      inactiveTime: Date.now() - lastActivityRef.current,
    }),
    resetSession: () => {
      sessionStartRef.current = Date.now();
      resetTimeout();
    },
  };
}

/**
 * Login History Hook
 * Tracks user login attempts and successful sessions
 */
export function useLoginHistory() {
  const addLoginRecord = (email, accountType, success, method = 'email') => {
    const record = {
      email,
      accountType,
      success,
      method,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'N/A', // Would come from backend in production
    };

    const history = JSON.parse(localStorage.getItem('tenancy_login_history') || '[]');
    history.push(record);

    // Keep only last 50 records
    if (history.length > 50) {
      history.shift();
    }

    localStorage.setItem('tenancy_login_history', JSON.stringify(history));
    return record;
  };

  const getLoginHistory = () => {
    return JSON.parse(localStorage.getItem('tenancy_login_history') || '[]');
  };

  const getRecentLogins = (days = 7) => {
    const history = getLoginHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return history.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate > cutoffDate && record.success;
    });
  };

  const detectSuspiciousActivity = () => {
    const history = getLoginHistory();
    const recentFailures = history.filter(r => !r.success).slice(-5);

    // Flag if 3+ failed attempts in last 5 records
    if (recentFailures.length >= 3) {
      return {
        suspicious: true,
        reason: 'multiple_failed_attempts',
        failedAttempts: recentFailures.length,
      };
    }

    return { suspicious: false };
  };

  return {
    addLoginRecord,
    getLoginHistory,
    getRecentLogins,
    detectSuspiciousActivity,
  };
}
