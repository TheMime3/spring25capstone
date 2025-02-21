import { create } from 'zustand';
import { User } from '../types/auth';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
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
      set({
        user: response.user,
        isAuthenticated: true,
        error: null
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to login',
        isAuthenticated: false
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.register(name, email, password);
      set({
        user: response.user,
        isAuthenticated: true,
        error: null
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to register',
        isAuthenticated: false
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.logout();
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