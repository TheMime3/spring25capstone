import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

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

        // If the error is 401 and we're not already refreshing, try to refresh the token
        if (error.response?.status === 401 && !this.isRefreshing && originalRequest.url !== '/auth/refresh-token') {
          this.isRefreshing = true;
          
          try {
            const refreshResult = await this.refreshToken();
            this.isRefreshing = false;
            
            // Update the original request with the new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${refreshResult.accessToken}`;
            }
            
            // Retry the original request
            return this.api(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            // If refresh fails, clear tokens and reject
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return Promise.reject(apiError);
          }
        }

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
}

export const api = ApiService.getInstance();