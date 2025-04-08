import { create } from 'zustand';
import { GeneratedScript, ScriptHistoryState } from '../types/scriptGenerator';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase';
import { useAuthStore } from './authStore';
import { persist } from 'zustand/middleware';

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

export const useScriptHistoryStore = create<ScriptHistoryStore>()(
  persist(
    (set, get) => ({
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
            user_id: user.id,
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
            .eq('user_id', user.id)
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
            .eq('user_id', user.id);

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
            .eq('user_id', user.id);

          if (error) throw error;

          set({ scripts: [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'script-history-storage', // unique name for localStorage
      partialize: (state) => ({ scripts: state.scripts }), // only persist scripts array
    }
  )
);