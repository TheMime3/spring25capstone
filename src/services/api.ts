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
      baseURL: 'http://localhost:5000', // Replace with your API IP
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': Cookies.get('csrf-token'),
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

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.api(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const response = await this.refreshToken();
            const { accessToken } = response.data;
            
            Cookies.set('accessToken', accessToken, { 
              secure: true,
              sameSite: 'strict'
            });

            this.refreshSubscribers.forEach((callback) => callback(accessToken));
            this.refreshSubscribers = [];
            
            return this.api(originalRequest);
          } catch (refreshError) {
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        const apiError = {
          message: error.response?.data?.message || 'An error occurred',
          code: error.response?.data?.code,
          status: error.response?.status
        };

        return Promise.reject(apiError);
      }
    );
  }

  private async refreshToken() {
    const refreshToken = Cookies.get('refreshToken');
    return this.api.post('/auth/refresh-token', { refreshToken });
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  public async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    this.handleAuthResponse(response.data);
    return response.data;
  }

  public async register(name: string, email: string, password: string) {
    const response = await this.api.post('/auth/register', { name, email, password });
    this.handleAuthResponse(response.data);
    return response.data;
  }

  public async logout() {
    try {
      await this.api.post('/auth/logout');
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('csrf-token');
    }
  }

  public async getProfile() {
    return this.api.get('/user/profile');
  }

  public async updateProfile(data: Partial<User>) {
    return this.api.put('/user/profile', data);
  }

  public async changePassword(currentPassword: string, newPassword: string) {
    return this.api.put('/user/change-password', {
      currentPassword,
      newPassword
    });
  }

  private handleAuthResponse(data: AuthResponse) {
    const { accessToken, refreshToken, user } = data;
    
    Cookies.set('accessToken', accessToken, {
      secure: true,
      sameSite: 'strict'
    });
    
    Cookies.set('refreshToken', refreshToken, {
      secure: true,
      sameSite: 'strict'
    });

    // Update auth store
    useAuthStore.getState().setUser(user);
  }
}

export const api = ApiService.getInstance();