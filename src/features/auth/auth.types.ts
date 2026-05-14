/**
 * Auth feature type definitions.
 */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'farmer' | 'buyer' | 'vet' | 'admin' | 'USER' | 'INVESTOR';
  avatarUrl?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthData {
  user: User;
  access_token: string;
  refresh_token?: string;
}

export type AuthResponse = BaseResponse<AuthData>;

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
