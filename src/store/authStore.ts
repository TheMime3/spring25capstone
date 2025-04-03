import { create } from 'zustand';
import { User, ApiError } from '../types/auth';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    error: null
  }),

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.login(email, password);
      
      if (!response.user) {
        throw new Error('Login failed');
      }

      set({
        user: response.user,
        isAuthenticated: true,
        error: null
      });
    } catch (error: any) {
      set({
        error: error.message,
        isAuthenticated: false,
        user: null
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (firstName, lastName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.register(firstName, lastName, email, password);
      
      if (!response.user) {
        throw new Error('Registration failed');
      }

      set({
        user: response.user,
        isAuthenticated: true,
        error: null
      });
    } catch (error: any) {
      set({
        error: error.message,
        isAuthenticated: false,
        user: null
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // Just clear the local state since we're not using Supabase auth
      localStorage.removeItem('user');
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }
}));