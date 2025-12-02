// Helper to handle authentication during payment flow
import { authClient } from './auth-client';
import { restoreAuthState, saveAuthState } from './auth-persistence';
import { debugStorage } from './storage-debug';

export async function ensureAuthentication(redirectUrl?: string): Promise<boolean> {
  try {
    console.log('=== PAYMENT AUTH CHECK ===');
    debugStorage();
    
    // First, try to reinitialize from storage
    authClient.reinitializeFromStorage();
    
    if (authClient.isAuthenticated()) {
      console.log('User is authenticated');
      return true;
    }
    
    console.log('User not authenticated, attempting restoration...');
    
    // Try to restore from persistence
    const restored = restoreAuthState();
    if (restored) {
      authClient.reinitializeFromStorage();
      
      if (authClient.isAuthenticated()) {
        console.log('Authentication restored successfully');
        return true;
      }
    }
    
    console.log('Authentication restoration failed');
    return false;
    
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

export function setupAuthRestoreOnFocus() {
  if (typeof window === 'undefined') return;
  
  const handleFocus = async () => {
    console.log('Window focused, checking auth state...');
    const isAuth = await ensureAuthentication();
    if (isAuth) {
      console.log('Auth restored on window focus');
      // Trigger a refresh of auth context
      window.dispatchEvent(new CustomEvent('auth-restored'));
    }
  };
  
  window.addEventListener('focus', handleFocus);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('focus', handleFocus);
  };
}