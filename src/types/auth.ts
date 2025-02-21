export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}