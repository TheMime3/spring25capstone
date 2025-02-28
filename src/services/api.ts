import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { QuestionnaireResponse } from '../types/questionnaire';

export class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {
    // Use the environment variable or fallback to the current window location
    const apiUrl = import.meta.env.VITE_API_URL || 
                  (window.location.hostname === 'localhost' 
                    ? 'http://localhost:5000'
                    : `http://${window.location.hostname}:5000`);
    
    this.api = axios.create({
      baseURL: apiUrl,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        // Handle API errors
        const apiError = {
          message: error.response?.data?.message || 'An error occurred',
          status: error.response?.status || 500,
          code: error.response?.data?.code || 'UNKNOWN_ERROR'
        };

        // We're no longer trying to refresh tokens automatically
        // This forces users to log in again when their token expires
        return Promise.reject(apiError);
      }
    );
  }

  public async login(email: string, password: string) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.message || 'Login failed',
        status: error.status || 500
      };
    }
  }

  public async register(firstName: string, lastName: string, email: string, password: string) {
    try {
      const response = await this.api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password
      });
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw {
        message: error.message || 'Registration failed',
        status: error.status || 500
      };
    }
  }

  public async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await this.api.post('/auth/logout', { refreshToken });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (error: any) {
      // Still remove tokens even if the API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw {
        message: error.message || 'Logout failed',
        status: error.status || 500
      };
    }
  }

  public async getProfile() {
    try {
      const response = await this.api.get('/user/profile');
      return response.data;
    } catch (error: any) {
      throw {
        message: error.message || 'Failed to fetch profile',
        status: error.status || 500
      };
    }
  }

  public async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw { message: 'No refresh token available', status: 401 };
      }
      
      const response = await this.api.post('/auth/refresh-token', { refreshToken });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data;
    } catch (error: any) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw {
        message: error.message || 'Failed to refresh token',
        status: error.status || 500
      };
    }
  }

  // Questionnaire methods
  public async saveQuestionnaire(data: QuestionnaireResponse) {
    try {
      const response = await this.api.post('/user/questionnaire', data);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.message || 'Failed to save questionnaire',
        status: error.status || 500
      };
    }
  }

  public async getQuestionnaire() {
    try {
      const response = await this.api.get('/user/questionnaire');
      return response.data;
    } catch (error: any) {
      // If 404, it means no questionnaire exists yet
      if (error.status === 404) {
        return null;
      }
      throw {
        message: error.message || 'Failed to fetch questionnaire',
        status: error.status || 500
      };
    }
  }
}

export const api = ApiService.getInstance();