import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token validity
      api.auth.getMe(token)
        .then(response => {
          if (response.success) {
            setUser(response.user);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await api.auth.login(credentials);
      if (response.success) {
        const { token: newToken, user: userData } = response;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  };

  const demoLogin = async () => {
    try {
      console.log('🚀 Starting demo login...');
      const response = await api.auth.demoLogin();
      console.log('📡 Demo login response:', response);
      
      if (response.success) {
        const { token: newToken, user: userData } = response;
        console.log('✅ Demo login successful, setting user:', userData);
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        return { success: true };
      }
      console.log('❌ Demo login failed - response not successful');
      return { success: false, error: 'Demo login failed' };
    } catch (error) {
      console.log('❌ Demo login error:', error);
      return { 
        success: false, 
        error: error.message || 'Demo login failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    demoLogin,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 