import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ScriptGeneratorState } from '../types/scriptGenerator';
import { useAuthStore } from './authStore';

interface ScriptGeneratorStore {
  // Current responses state
  responses: ScriptGeneratorState;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateResponse: (field: string, value: string) => void;
  saveResponses: () => Promise<boolean>;
  loadResponses: () => Promise<boolean>;
  resetResponses: () => void;
}

// Initial state for the script generator
const initialState: ScriptGeneratorState = {
  coreProblem: '',
  idealCustomer: '',
  businessInspiration: '',
  uniqueValue: '',
  keyMessage: '',
  customerJourney: '',
  callToAction: '',
};

export const useScriptGeneratorStore = create<ScriptGeneratorStore>()(
  persist(
    (set, get) => ({
      // State
      responses: initialState,
      isLoading: false,
      error: null,

      // Actions
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
          // In a real implementation, this would save to an API
          // For now, we'll just simulate a delay and return success
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
          // In a real implementation, this would load from an API
          // For now, we'll just simulate a delay and return the current state
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to load responses' 
          });
          return false;
        }
      },

      resetResponses: () => {
        set({ responses: initialState, error: null });
      },
    }),
    {
      name: 'script-generator-storage',
      // Only persist the responses
      partialize: (state) => ({ responses: state.responses }),
    }
  )
);