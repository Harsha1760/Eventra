import { createContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => storage.getToken());
  const [user, setUser] = useState(() => storage.getUser());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    storage.clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // Initial verification of stored token
    const storedToken = storage.getToken();
    const storedUser = storage.getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      storage.clearAuth();
      setToken(null);
      setUser(null);
    }
    setLoading(false);

    // Listen for unauthorized 401 events from api.js
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('eventra:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('eventra:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (response && response.token) {
      storage.setToken(response.token);
      storage.setUser(response.user);
      setToken(response.token);
      setUser(response.user);
      return response;
    }
    throw new Error('Invalid login response from server');
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    return response;
  };

  const updateUserProfile = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    storage.setUser(updatedUser);
    setUser(updatedUser);
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(
    user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN')
  );

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

