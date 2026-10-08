import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('personaflow_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data?.success) {
          setUser(res.data.data.user);
        }
      } catch (err) {
        console.warn('Could not verify active session:', err.message);
        localStorage.removeItem('personaflow_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      const { user: loggedInUser, token: authToken } = res.data.data;
      localStorage.setItem('personaflow_token', authToken);
      setToken(authToken);
      setUser(loggedInUser);
      return loggedInUser;
    }
    throw new Error(res.data?.error?.message || 'Login failed');
  };

  const loginAsDemo = async () => {
    return login('alex@personaflow.ai', 'Password123!');
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.success) {
      const { user: newUser, token: authToken } = res.data.data;
      localStorage.setItem('personaflow_token', authToken);
      setToken(authToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.data?.error?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('personaflow_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
