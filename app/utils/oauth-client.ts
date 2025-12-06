"use client";

import { apiClient } from './api-client';
import { User } from './auth-client';

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

export interface OAuthResponse {
  access_token: string;
  user: User;
}

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// GitHub OAuth removed - only Google OAuth supported

class OAuthClient {
  private googleInitialized = false;

  // Removed initializeGoogle to avoid GSI/CORS issues
  // We'll use standard OAuth2 flow instead

  async signInWithGoogle(): Promise<OAuthResponse> {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }

    // Skip GSI and use OAuth2 popup directly to avoid CORS and FedCM issues
    return this.googlePopupSignIn();
  }

  private async googlePopupSignIn(): Promise<OAuthResponse> {
    return new Promise((resolve, reject) => {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = 'openid profile email';
      // Use correct Google OAuth endpoint
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=online&` +
        `prompt=select_account`;

      const popup = window.open(
        authUrl, 
        'google-signin', 
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        reject(new Error('Failed to open popup window. Please allow popups and try again.'));
        return;
      }

      let isCompleted = false;

      // Listen for message from popup FIRST (before polling)
      const messageListener = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (isCompleted) return; // Prevent duplicate processing
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          isCompleted = true;
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          
          try {
            // Close popup safely - don't try due to COOP
            // Let browser handle popup cleanup
            
            const result = await this.sendGoogleTokenToBackend(event.data.accessToken);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          isCompleted = true;
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          
          // Don't try to close popup due to COOP
          reject(new Error(event.data.error || 'Google authentication failed'));
        }
      };

      window.addEventListener('message', messageListener);

      // Poll for popup closure (with better COOP protection)
      const checkClosed = setInterval(() => {
        if (isCompleted) {
          clearInterval(checkClosed);
          return;
        }
        
        // Don't try to access popup.closed due to COOP
        // Just rely on message listener and timeout
      }, 5000); // Check less frequently

      // Add timeout to prevent hanging
      setTimeout(() => {
        if (!isCompleted) {
          isCompleted = true;
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          // Don't try to close popup due to COOP - browser will handle cleanup
          reject(new Error('Google sign-in timed out. Please try again.'));
        }
      }, 300000); // 5 minute timeout
    });
  }

  private async sendGoogleTokenToBackend(accessToken: string): Promise<OAuthResponse> {
    const response = await apiClient.post<OAuthResponse>('/api/auth/oauth/google/', {
      access_token: accessToken,
    });
    
    // Store the access token
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      apiClient.setAccessToken(response.access_token);
    }
    
    return response;
  }

  // GitHub OAuth removed - only Google OAuth supported
}

export const oauthClient = new OAuthClient();