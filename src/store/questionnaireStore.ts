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
  updateBusinessInfo: (field: string, value: string) => void;
  updateContactInfo: (field: string, value: string) => void;
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
  businessInfo: {
    businessName: '',
    businessYears: '',
    industry: '',
    targetAudience: '',
    learningInterests: '',
    foundUs: '',
  },
  contactInfo: {
    contactDetails: '',
    certifications: '',
  }
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

      updateBusinessInfo: (field, value) => {
        set((state) => ({
          responses: {
            ...state.responses,
            businessInfo: {
              ...state.responses.businessInfo,
              [field]: value,
            },
          },
        }));
      },

      updateContactInfo: (field, value) => {
        set((state) => ({
          responses: {
            ...state.responses,
            contactInfo: {
              ...state.responses.contactInfo,
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
          const user = useAuthStore.getState().user;
          
          if (!user) {
            throw new Error('User not authenticated');
          }

          const data = await api.getQuestionnaire(user.id);
          
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
          // If 404, it means no questionnaire exists yet, which is fine
          if (error.status === 404) {
            set({ isLoading: false });
            return false;
          }
          
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
      // Add version to handle schema changes
      version: 1,
      // Add migration to handle old data format
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          // If we have old data format, reset to initial state
          return { responses: initialState };
        }
        return persistedState as { responses: QuestionnaireState };
      },
    }
  )
);