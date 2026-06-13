import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          apiClient.setToken(token);
          const response = await apiClient.getCurrentUser();
          if (response.success) {
            setUser(response.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signup = async (fullName, email, password, accountType) => {
    try {
      setError(null);
      const response = await apiClient.signup({
        fullName,
        email,
        password,
        accountType,
      });

      if (response.success) {
        // Signup = new full session — persist
        apiClient.setPersistentToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password, accountType) => {
    try {
      setError(null);
      const response = await apiClient.login(email, password, accountType);

      if (response.success) {
        if (response.requiresPasswordChange) {
          // Stop here so the UI can render the force reset form
          // Use session-only token so it doesn't overwrite other users in other tabs
          apiClient.setToken(response.tempToken);
          return response;
        } else if (response.requiresTwoFactor) {
          // 2FA required — temp token, session-scoped only
          apiClient.setToken(response.tempToken);
          return response;
        } else {
          // Successful full login — persist across page reloads
          apiClient.setPersistentToken(response.token);
          setUser(response.user);
          setIsAuthenticated(true);
          return response;
        }
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const googleLogin = async (token, accountType) => {
    try {
      setError(null);
      const response = await apiClient.googleLogin(token, accountType);

      if (response.success) {
        if (response.requiresTwoFactor) {
          // Temp token — session-scoped only
          apiClient.setToken(response.tempToken);
          return response;
        } else {
          // Successful Google login — persist
          apiClient.setPersistentToken(response.token);
          setUser(response.user);
          setIsAuthenticated(true);
          return response;
        }
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const forcePasswordReset = async (tempToken, newPassword) => {
    try {
      setError(null);
      const response = await apiClient.forcePasswordReset(tempToken, newPassword);

      if (response.success) {
        // Persist the new token — this is the tenant's first real login after reset
        apiClient.setPersistentToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const verify2FA = async (code) => {
    try {
      setError(null);
      const response = await apiClient.verify2FA(code);

      if (response.success) {
        // 2FA complete — persist the real session token
        apiClient.setPersistentToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const acceptInvite = async (token, inviteData) => {
    try {
      setError(null);
      const response = await apiClient.acceptInvite(token, inviteData);

      if (response.success) {
        apiClient.setPersistentToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    apiClient.setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (data) => {
    try {
      setError(null);
      const response = await apiClient.updateProfile(data);

      if (response.success) {
        setUser(response.user);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    signup,
    login,
    googleLogin,
    forcePasswordReset,
    verify2FA,
    acceptInvite,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
