import { useState, useEffect } from 'react';
import { storageUtils } from '../../../shared/utils';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string; role: string; name: string; } | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const savedUser = storageUtils.get('admin_user');
    if (savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (credentials: { username: string; password: string }) => {
    // Mock authentication - replace with real API call
    if (credentials.username === 'admin123' && credentials.password === 'indostreet2024') {
      const userData = {
        id: '1',
        username: credentials.username,
        role: 'admin',
        name: 'System Administrator',
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      storageUtils.set('admin_user', userData);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    storageUtils.remove('admin_user');
  };

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
};