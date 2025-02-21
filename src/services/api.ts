import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '../store/authStore';

export class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:5000',
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
        const token = Cookies.get('accessToken');
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

        return Promise.reject(apiError);
      }
    );
  }

  public async login(email: string, password: string) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
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
      return response.data;
    } catch (error: any) {
      throw {
        message: error.message || 'Registration failed',
        status: error.status || 500
      };
    }
  }

  public async logout() {
    try {
      await this.api.post('/auth/logout');
    } catch (error: any) {
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
}

export const api = ApiService.getInstance();