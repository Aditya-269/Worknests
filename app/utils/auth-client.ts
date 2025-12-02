"use client";

import { apiClient, ApiError } from './api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  user_type: 'COMPANY' | 'JOB_SEEKER' | null;
  onboarding_completed: boolean;
  created_at: string;
  image?: string; // For compatibility with existing components
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string; // May come in httpOnly cookie instead
  user: User;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  confirm_password?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    // Initialize with any existing token from localStorage
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      if (this.accessToken) {
        apiClient.setAccessToken(this.accessToken);
        console.log("AuthClient initialized with stored token");
      }
    }
  }

  // Public method to reinitialize from storage if needed
  reinitializeFromStorage() {
    this.initializeFromStorage();
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/signup/', data);
      this.setAccessToken(response.access_token);
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login/', data);
      this.setAccessToken(response.access_token);
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout/');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getUser(): Promise<User> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      return await apiClient.get<User>('/api/auth/user/');
    } catch (error: any) {
      if (error.status === 401) {
        // Token might be expired, try to refresh
        await this.refreshToken();
        return await apiClient.get<User>('/api/auth/user/');
      }
      throw error;
    }
  }

  async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await apiClient.post<{ access_token: string }>('/api/auth/token/refresh/');
        this.setAccessToken(response.access_token);
        return response.access_token;
      } catch (error) {
        this.clearTokens();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async completeOnboarding(): Promise<User> {
    try {
      const response = await apiClient.post<{ user: User }>('/api/auth/onboarding/complete/');
      return response.user;
    } catch (error: any) {
      if (error.status === 401) {
        await this.refreshToken();
        const response = await apiClient.post<{ user: User }>('/api/auth/onboarding/complete/');
        return response.user;
      }
      throw error;
    }
  }

  async resetOnboarding(): Promise<User> {
    try {
      const response = await apiClient.post<{ user: User }>('/api/auth/onboarding/reset/');
      return response.user;
    } catch (error: any) {
      if (error.status === 401) {
        await this.refreshToken();
        const response = await apiClient.post<{ user: User }>('/api/auth/onboarding/reset/');
        return response.user;
      }
      throw error;
    }
  }

  private setAccessToken(token: string) {
    this.accessToken = token;
    apiClient.setAccessToken(token);
    
    // Persist token to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private clearTokens() {
    this.accessToken = null;
    apiClient.setAccessToken(null);
    
    // Clear persisted tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export const authClient = new AuthClient();