import apiClient from '../../api/client';
import type { AuthResponse, LoginRequest, RegisterRequest } from './auth.types';

/**
 * Auth API service.
 * All auth-related HTTP calls live here — slices call these, not apiClient directly.
 */
const AuthService = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<Pick<AuthResponse, 'accessToken'>> => {
    const response = await apiClient.post<Pick<AuthResponse, 'accessToken'>>(
      '/auth/refresh',
      { refreshToken },
    );
    return response.data;
  },
};

export default AuthService;
