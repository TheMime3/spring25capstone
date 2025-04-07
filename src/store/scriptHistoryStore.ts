import { create } from 'zustand';
import { GeneratedScript, ScriptHistoryState } from '../types/scriptGenerator';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase';

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
      const newScript: GeneratedScript = {
        id: uuidv4(),
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
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: false });

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
      const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', id);

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
      const { error } = await supabase
        .from('scripts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) throw error;

      set({ scripts: [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));