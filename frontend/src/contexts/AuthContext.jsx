import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = localStorage.getItem('vv_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.verifySession();
      setUser(res.data.user);
    } catch (err) {
      console.error('Session validation failed:', err);
      localStorage.removeItem('vv_token');
      localStorage.removeItem('vv_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginCollege = async (email, password) => {
    const res = await authAPI.collegeLogin({ email, password });
    const { token, college } = res.data;
    localStorage.setItem('vv_token', token);
    const userData = { ...college, role: 'college_admin', college_id: college.id };
    localStorage.setItem('vv_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const loginSuperAdmin = async (email, password) => {
    const res = await authAPI.superAdminLogin({ email, password });
    const { token, admin } = res.data;
    localStorage.setItem('vv_token', token);
    const userData = { ...admin, role: 'super_admin' };
    localStorage.setItem('vv_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('vv_token');
    localStorage.removeItem('vv_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginCollege, loginSuperAdmin, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
