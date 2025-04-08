import { supabase } from './supabase';
import { QuestionnaireResponse } from '../types/questionnaire';
import { ScriptGeneratorState } from '../types/scriptGenerator';
import { QuestionnaireState } from '../types/questionnaire';

export class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      throw new Error('Authentication required');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw {
        message: error.error || 'An error occurred',
        status: response.status,
      };
    }

    return response.json();
  }

  public async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw {
          message: 'Invalid email or password',
          status: 401,
        };
      }
      throw error;
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        firstName: data.user.user_metadata.first_name || '',
        lastName: data.user.user_metadata.last_name || '',
      }
    };
  }

  public async register(firstName: string, lastName: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.status === 400 && error.message.includes('already registered')) {
        throw {
          message: 'User already registered',
          status: 409,
          code: 'USER_EXISTS',
        };
      }
      throw error;
    }

    if (!data.user) {
      throw new Error('Registration failed');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        firstName: data.user.user_metadata.first_name,
        lastName: data.user.user_metadata.last_name,
      }
    };
  }

  public async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw error;
    }

    return true;
  }

  public async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return true;
  }

  public async getProfile() {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      throw new Error('Authentication required');
    }

    return {
      id: session.user.id,
      email: session.user.email!,
      firstName: session.user.user_metadata.first_name,
      lastName: session.user.user_metadata.last_name,
    };
  }

  public async updateProfile(data: { firstName?: string; lastName?: string; email?: string }) {
    const { data: updateData, error } = await supabase.auth.updateUser({
      email: data.email,
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
      }
    });

    if (error) {
      throw error;
    }

    return {
      id: updateData.user.id,
      email: updateData.user.email!,
      firstName: updateData.user.user_metadata.first_name,
      lastName: updateData.user.user_metadata.last_name,
    };
  }

  public async saveQuestionnaire(data: QuestionnaireResponse) {
    return this.fetchWithAuth('questionnaire', {
      method: 'POST',
      body: JSON.stringify({ responses: data.responses }),
    });
  }

  public async getQuestionnaire() {
    return this.fetchWithAuth('questionnaire');
  }

  public async generateScript(params: {
    scriptResponses: ScriptGeneratorState;
    businessProfile: QuestionnaireState;
    userName?: string;
  }) {
    const response = await this.fetchWithAuth('script', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.script;
  }
}

export const api = ApiService.getInstance();