import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuestionnaireState } from '../types/questionnaire';
import { api } from '../services/api';
import { useAuthStore } from './authStore';

interface QuestionnaireStore {
  // Current questionnaire state
  responses: QuestionnaireState;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateBasicInfo: (field: string, value: string) => void;
  updatePresentationDetails: (field: string, value: string | string[]) => void;
  updateGoals: (field: string, value: string) => void;
  saveQuestionnaire: () => Promise<boolean>;
  loadQuestionnaire: () => Promise<boolean>;
  resetQuestionnaire: () => void;
}

// Initial state for the questionnaire
const initialState: QuestionnaireState = {
  basicInfo: {
    presentationType: 'Business pitch',
    audienceSize: 'Small (1-10 people)',
  },
  presentationDetails: {
    duration: '5-15 minutes',
    visualAids: [],
  },
  goals: {
    primaryGoal: 'Inform or educate the audience',
    concerns: '',
  },
};

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set, get) => ({
      // State
      responses: initialState,
      isLoading: false,
      error: null,

      // Actions
      updateBasicInfo: (field, value) => {
        set((state) => ({
          responses: {
            ...state.responses,
            basicInfo: {
              ...state.responses.basicInfo,
              [field]: value,
            },
          },
        }));
      },

      updatePresentationDetails: (field, value) => {
        set((state) => ({
          responses: {
            ...state.responses,
            presentationDetails: {
              ...state.responses.presentationDetails,
              [field]: value,
            },
          },
        }));
      },

      updateGoals: (field, value) => {
        set((state) => ({
          responses: {
            ...state.responses,
            goals: {
              ...state.responses.goals,
              [field]: value,
            },
          },
        }));
      },

      saveQuestionnaire: async () => {
        set({ isLoading: true, error: null });
        try {
          const { responses } = get();
          const user = useAuthStore.getState().user;
          
          if (!user) {
            throw new Error('User not authenticated');
          }

          await api.saveQuestionnaire({
            userId: user.id,
            responses,
          });
          
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to save questionnaire' 
          });
          return false;
        }
      },

      loadQuestionnaire: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.getQuestionnaire();
          
          if (data && data.responses) {
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
            error: error.message || 'Failed to load questionnaire' 
          });
          return false;
        }
      },

      resetQuestionnaire: () => {
        set({ responses: initialState, error: null });
      },
    }),
    {
      name: 'questionnaire-storage',
      // Only persist the responses
      partialize: (state) => ({ responses: state.responses }),
    }
  )
);