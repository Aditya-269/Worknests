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

// GitHub OAuth Configuration  
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';
const GITHUB_REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || (typeof window !== 'undefined' ? `${window.location.origin}/auth/github/callback` : '');

class OAuthClient {
  private googleInitialized = false;

  async initializeGoogle(): Promise<void> {
    if (this.googleInitialized || !GOOGLE_CLIENT_ID) return;

    return new Promise((resolve, reject) => {
      // Load Google API script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: () => {}, // Will be set per login attempt
          });
          this.googleInitialized = true;
          resolve();
        } else {
          reject(new Error('Google API failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  async signInWithGoogle(): Promise<OAuthResponse> {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }

    await this.initializeGoogle();

    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google API not loaded'));
        return;
      }

      // Use Google One Tap or popup
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fall back to popup
          this.googlePopupSignIn().then(resolve).catch(reject);
        }
      });

      // Set callback for credential response
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            // Decode the JWT credential to get user info
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            
            // Create a mock access token response for our backend
            const mockAccessToken = response.credential; // We'll send the credential as access token
            
            const result = await this.sendGoogleTokenToBackend(mockAccessToken);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
      });
    });
  }

  private async googlePopupSignIn(): Promise<OAuthResponse> {
    // Alternative popup method if One Tap doesn't work
    return new Promise((resolve, reject) => {
      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
        `scope=profile email&` +
        `response_type=code&` +
        `access_type=online`;

      const popup = window.open(authUrl, 'google-signin', 'width=500,height=600');
      
      // Poll for popup closure or message
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          reject(new Error('Google sign-in was cancelled'));
        }
      }, 1000);

      // Listen for message from popup
      const messageListener = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageListener);
          
          try {
            const result = await this.sendGoogleTokenToBackend(event.data.accessToken);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      };

      window.addEventListener('message', messageListener);
    });
  }

  private async sendGoogleTokenToBackend(accessToken: string): Promise<OAuthResponse> {
    const response = await apiClient.post<OAuthResponse>('/api/auth/oauth/google/', {
      access_token: accessToken,
    });
    return response;
  }

  async signInWithGitHub(): Promise<OAuthResponse> {
    if (!GITHUB_CLIENT_ID) {
      throw new Error('GitHub Client ID not configured');
    }

    return new Promise((resolve, reject) => {
      const state = Math.random().toString(36).substring(7);
      const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${GITHUB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&` +
        `scope=user:email&` +
        `state=${state}`;

      const popup = window.open(authUrl, 'github-signin', 'width=500,height=600');
      
      // Poll for popup closure
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          reject(new Error('GitHub sign-in was cancelled'));
        }
      }, 1000);

      // Listen for message from popup
      const messageListener = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageListener);
          
          try {
            const result = await this.sendGitHubTokenToBackend(event.data.accessToken);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup?.close();
          window.removeEventListener('message', messageListener);
          reject(new Error(event.data.error || 'GitHub authentication failed'));
        }
      };

      window.addEventListener('message', messageListener);
    });
  }

  private async sendGitHubTokenToBackend(accessToken: string): Promise<OAuthResponse> {
    const response = await apiClient.post<OAuthResponse>('/api/auth/oauth/github/', {
      access_token: accessToken,
    });
    return response;
  }
}

export const oauthClient = new OAuthClient();