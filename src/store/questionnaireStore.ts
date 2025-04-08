import { create } from 'zustand';
import { QuestionnaireState } from '../types/questionnaire';
import { api } from '../services/api';
import { useAuthStore } from './authStore';
import { supabase } from '../services/supabase';

interface QuestionnaireStore {
  responses: QuestionnaireState;
  isLoading: boolean;
  error: string | null;
  updateBasicInfo: (field: string, value: string) => void;
  updateBusinessInfo: (field: string, value: string) => void;
  updateContactInfo: (field: string, value: string) => void;
  saveQuestionnaire: () => Promise<boolean>;
  loadQuestionnaire: () => Promise<boolean>;
  resetQuestionnaire: () => Promise<void>;
}

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

export const useQuestionnaireStore = create<QuestionnaireStore>()((set, get) => ({
  responses: initialState,
  isLoading: false,
  error: null,

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

      const { error } = await supabase.rpc('handle_questionnaire', {
        p_user_id: user.id,
        p_responses: responses
      });

      if (error) throw error;
      
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

      const { data, error } = await supabase
        .from('questionnaires')
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
        error: error.message || 'Failed to load questionnaire' 
      });
      return false;
    }
  },

  resetQuestionnaire: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ responses: initialState, error: null });

    try {
      const { error } = await supabase
        .from('questionnaires')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Failed to reset questionnaire:', error);
    }
  },
}));