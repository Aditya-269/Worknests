"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient, User } from './auth-client';
import { oauthClient, OAuthResponse } from './oauth-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email?: string, password?: string) => Promise<User | void>;
  signup: (email: string, password: string, name: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  // GitHub login removed
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    console.log('AuthContext: Starting auth check on mount');
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // First check if we have a stored token
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      if (storedToken && !authClient.isAuthenticated()) {
        console.log('Reinitializing auth client from stored token');
        authClient.reinitializeFromStorage();
      }
      
      if (authClient.isAuthenticated()) {
        console.log('AuthContext: User is authenticated, fetching user data...');
        try {
          const userData = await authClient.getUser();
          setUser(userData);
          console.log('AuthContext: Auth state checked successfully, user:', userData.email);
        } catch (userError: any) {
          console.error('Failed to fetch user data:', userError);
          
          // If it's a 404, the API endpoint doesn't exist
          if (userError.status === 404) {
            console.error('User API endpoint not found - this indicates a configuration issue');
            // Don't logout for 404s - API might be down
            setUser({
              id: 'temp-user',
              email: 'authenticated@user.com',
              name: 'Authenticated User',
              user_type: null,
              onboarding_completed: false,
              created_at: new Date().toISOString()
            } as User);
          } else if (userError.status === 401 || userError.status === 403) {
            // Invalid token - try to refresh first
            console.log('Invalid token detected, attempting refresh...');
            try {
              await authClient.refreshToken();
              // Try fetching user again after refresh
              const userData = await authClient.getUser();
              setUser(userData);
              console.log('Token refreshed successfully, user:', userData.email);
            } catch (refreshError) {
              console.log('Token refresh failed, clearing auth state');
              await authClient.logout();
              setUser(null);
            }
          } else {
            // Other errors - keep current state
            console.log('Network error during user fetch, keeping auth state');
          }
        }
      } else {
        console.log('AuthContext: No authentication found during auth state check');
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        console.log('AuthContext: Stored token exists:', !!token);
        setUser(null);
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email?: string, password?: string): Promise<User | void> => {
    // If no email/password provided, just check existing auth state
    if (!email || !password) {
      return simpleLogin();
    }
    
    setIsLoading(true);
    try {
      const response = await authClient.login({ email, password });
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authClient.signup({ 
        email, 
        password, 
        name,
        confirm_password: password // Add confirm_password field for backend validation
      });
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await oauthClient.signInWithGoogle();
      authClient.setAccessToken(response.access_token); // Set token in auth client
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  // GitHub OAuth removed
  
  // Simple login method for form-based authentication
  const simpleLogin = async (): Promise<void> => {
    if (authClient.isAuthenticated()) {
      try {
        const userData = await authClient.getUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to get user data during login:', error);
        throw error;
      }
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authClient.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (authClient.isAuthenticated()) {
        const userData = await authClient.getUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await logout();
    }
  };

  const completeOnboarding = async () => {
    try {
      const updatedUser = await authClient.completeOnboarding();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    loginWithGoogle,
    // GitHub login removed
    logout,
    refreshUser,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}