import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('crimenet_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('crimenet_token'));
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authService.login(username, password);
      const { access_token, user: userData } = res.data;
      localStorage.setItem('crimenet_token', access_token);
      localStorage.setItem('crimenet_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('CRIMENET Login Error:', err);
      const errorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        (err.code === 'ECONNABORTED' ? 'Request timed out. Server may be waking up from sleep; please try again.' : null) ||
        (err.message === 'Network Error' ? 'Network error: Backend server is temporarily unreachable or restarting. Please retry in a few seconds.' : null) ||
        err.message ||
        'Authentication failed. Please verify credentials.';
      return {
        success: false,
        error: errorMsg
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('crimenet_token');
    localStorage.removeItem('crimenet_user');
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (roleName = 'INVESTIGATOR') => {
    const creds = {
      ADMIN: { u: 'admin', p: 'admin123' },
      INVESTIGATOR: { u: 'investigator', p: 'investigator123' },
      ANALYST: { u: 'analyst', p: 'analyst123' },
      VIEWER: { u: 'viewer', p: 'viewer123' },
    }[roleName] || { u: 'investigator', p: 'investigator123' };

    return await login(creds.u, creds.p);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, quickDemoLogin, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
