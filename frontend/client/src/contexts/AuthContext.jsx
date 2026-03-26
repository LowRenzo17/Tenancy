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
        apiClient.setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await apiClient.login(email, password);

      if (response.success) {
        if (response.requiresTwoFactor) {
          // 2FA required, return temp token
          apiClient.setToken(response.tempToken);
          return response;
        } else {
          // Login successful
          apiClient.setToken(response.token);
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

  const verify2FA = async (code) => {
    try {
      setError(null);
      const response = await apiClient.verify2FA(code);

      if (response.success) {
        apiClient.setToken(response.token);
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
    verify2FA,
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
