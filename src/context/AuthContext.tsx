import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading, login, register, logout, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if we have tokens in localStorage
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken || !refreshToken) {
        setLoading(false);
        return;
      }
      
      try {
        // Try to get user profile with current token
        const userProfile = await api.getProfile();
        setUser({
          id: userProfile.id,
          firstName: userProfile.firstName || userProfile.first_name,
          lastName: userProfile.lastName || userProfile.last_name,
          email: userProfile.email
        });
      } catch (error) {
        // If token is expired, try to refresh
        try {
          await api.refreshToken();
          const userProfile = await api.getProfile();
          setUser({
            id: userProfile.id,
            firstName: userProfile.firstName || userProfile.first_name,
            lastName: userProfile.lastName || userProfile.last_name,
            email: userProfile.email
          });
        } catch (refreshError) {
          // If refresh fails, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading: isLoading || loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};