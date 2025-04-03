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
      }
    });
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

      // Log audit event
      await this.logAuditEvent(user.id, 'login', {
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent
      });

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

      // Try to create user - this will fail if email already exists due to unique constraint
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

      // Log audit event
      await this.logAuditEvent(userId, 'register', {
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent
      });

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
      const { error } = await supabase
        .from('questionnaires')
        .upsert({
          user_id: data.userId,
          responses: data.responses
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
    try {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
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
      const response = await this.api.post('/script/generate', params);
      return response.data.script;
    } catch (error: any) {
      throw {
        message: error.message || 'Failed to generate script',
        status: error.status || 500
      };
    }
  }

  public async logAuditEvent(userId: string, eventType: string, details: { ip_address?: string; user_agent?: string }) {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: userId,
          event_type: eventType,
          ...details
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }
}

export const api = ApiService.getInstance();