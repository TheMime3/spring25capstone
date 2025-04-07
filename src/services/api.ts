import axios, { AxiosInstance } from 'axios';
import { supabase } from './supabase';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { QuestionnaireResponse } from '../types/questionnaire';
import { ScriptGeneratorState } from '../types/scriptGenerator';
import { QuestionnaireState } from '../types/questionnaire';

export class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000, // Increased timeout for AI operations
    });

    // Add response interceptor for better error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
        if (!error.response) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        throw error;
      }
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async login(email: string, password: string) {
    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (userError || !user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Log audit event using stored procedure
      const { error: auditError } = await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_event_type: 'login',
        p_ip_address: '127.0.0.1',
        p_user_agent: navigator.userAgent
      });

      if (auditError) {
        console.error('Failed to log audit event:', auditError);
        // Don't throw error here, just log it
      }

      // Return user data
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }
      };
    } catch (error: any) {
      throw {
        message: error.message || 'Login failed',
        status: 401
      };
    }
  }

  public async register(firstName: string, lastName: string, email: string, password: string) {
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      const userId = uuidv4();

      // Try to create user - this will fail if email already exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          password_hash: passwordHash
        }])
        .select('id, email, first_name, last_name')
        .single();

      if (userError) {
        // Check if error is due to duplicate email
        if (userError.code === '23505') {
          throw new Error('User already registered');
        }
        throw new Error('Failed to create user');
      }

      if (!user) {
        throw new Error('Failed to create user');
      }

      // Log audit event using stored procedure
      const { error: auditError } = await supabase.rpc('log_audit_event', {
        p_user_id: userId,
        p_event_type: 'register',
        p_ip_address: '127.0.0.1',
        p_user_agent: navigator.userAgent
      });

      if (auditError) {
        console.error('Failed to log audit event:', auditError);
        // Don't throw error here, just log it
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }
      };
    } catch (error: any) {
      throw {
        message: error.message || 'Registration failed',
        status: error.status || 500
      };
    }
  }

  public async getProfile(userId: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      };
    } catch (error: any) {
      throw {
        message: error.message || 'Failed to fetch profile',
        status: error.status || 500
      };
    }
  }

  public async saveQuestionnaire(data: QuestionnaireResponse) {
    try {
      if (!data.userId) {
        throw new Error('User ID is required');
      }

      // Call stored procedure to handle questionnaire insert/update
      const { error } = await supabase.rpc('handle_questionnaire', {
        p_user_id: data.userId,
        p_responses: data.responses
      });

      if (error) throw error;
      return true;
    } catch (error: any) {
      throw {
        message: error.message || 'Failed to save questionnaire',
        status: error.status || 500
      };
    }
  }

  public async getQuestionnaire(userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results

      if (error) throw error;
      return data; // Will be null if no questionnaire exists
    } catch (error: any) {
      throw {
        message: error.message || 'Failed to fetch questionnaire',
        status: error.status || 500
      };
    }
  }

  public async generateScript(params: {
    scriptResponses: ScriptGeneratorState;
    businessProfile: QuestionnaireState;
    userName?: string;
  }) {
    try {
      // Validate input parameters
      if (!params.scriptResponses || !params.businessProfile) {
        throw new Error('Missing required script generation parameters');
      }

      // Validate business name specifically
      if (!params.businessProfile.businessInfo?.businessName) {
        throw new Error('Business name is required. Please complete your business profile first.');
      }

      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: params,
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate script');
      }

      if (!data?.script) {
        throw new Error('No script was generated. Please try again.');
      }

      return data.script;
    } catch (error: any) {
      console.error('Script generation error:', error);
      throw new Error(error.message || 'Failed to generate script. Please try again later.');
    }
  }
}

// Export a singleton instance of the ApiService
export const api = ApiService.getInstance();