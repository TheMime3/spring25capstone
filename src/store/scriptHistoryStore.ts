import { create } from 'zustand';
import { GeneratedScript, ScriptHistoryState } from '../types/scriptGenerator';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase';
import { useAuthStore } from './authStore';

interface ScriptHistoryStore extends ScriptHistoryState {
  isLoading: boolean;
  error: string | null;
  addScript: (content: string, title?: string) => Promise<GeneratedScript>;
  getScripts: () => Promise<void>;
  deleteScript: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  setScripts: (scripts: GeneratedScript[]) => void;
}

const initialState: ScriptHistoryState = {
  scripts: []
};

export const useScriptHistoryStore = create<ScriptHistoryStore>()((set, get) => ({
  ...initialState,
  isLoading: false,
  error: null,

  setScripts: (scripts) => {
    set({ scripts });
  },

  addScript: async (content, title) => {
    set({ isLoading: true, error: null });
    
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newScript = {
        id: uuidv4(),
        user_id: user.id, // Add user_id to match RLS policy
        content,
        createdAt: new Date().toISOString(),
        title: title || `Script ${get().scripts.length + 1}`
      };

      const { data, error } = await supabase
        .from('scripts')
        .insert([newScript])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        scripts: [data, ...state.scripts],
        isLoading: false
      }));

      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getScripts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('user_id', user.id) // Filter by user_id
        .order('createdAt', { ascending: false });

      if (error) throw error;

      set({ scripts: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteScript: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own scripts

      if (error) throw error;

      set((state) => ({
        scripts: state.scripts.filter(script => script.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearHistory: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('user_id', user.id); // Only clear user's own scripts

      if (error) throw error;

      set({ scripts: [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));