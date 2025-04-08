import { create } from 'zustand';
import { ScriptGeneratorState } from '../types/scriptGenerator';
import { useAuthStore } from './authStore';
import { supabase } from '../services/supabase';

interface ScriptGeneratorStore {
  responses: ScriptGeneratorState;
  isLoading: boolean;
  error: string | null;
  updateResponse: (field: string, value: string) => void;
  saveResponses: () => Promise<boolean>;
  loadResponses: () => Promise<boolean>;
  resetResponses: () => Promise<void>;
}

const initialState: ScriptGeneratorState = {
  coreProblem: '',
  idealCustomer: '',
  businessInspiration: '',
  uniqueValue: '',
  keyMessage: '',
  customerJourney: '',
  callToAction: '',
};

export const useScriptGeneratorStore = create<ScriptGeneratorStore>()((set, get) => ({
  responses: initialState,
  isLoading: false,
  error: null,

  updateResponse: (field, value) => {
    set((state) => ({
      responses: {
        ...state.responses,
        [field]: value,
      },
    }));
  },

  saveResponses: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('script_responses')
        .upsert({
          user_id: user.id,
          responses: get().responses,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to save responses' 
      });
      return false;
    }
  },

  loadResponses: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('script_responses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.responses) {
        set({ 
          responses: data.responses,
          isLoading: false 
        });
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to load responses' 
      });
      return false;
    }
  },

  resetResponses: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ responses: initialState, error: null });

    try {
      const { error } = await supabase
        .from('script_responses')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to reset responses:', error);
    }
  },
}));