// Utility to handle authentication persistence across redirects

export function saveAuthState() {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('access_token');
  if (token) {
    // Save additional auth state that might be lost during redirects
    localStorage.setItem('auth_timestamp', Date.now().toString());
    localStorage.setItem('auth_persisted', 'true');
  }
}

export function restoreAuthState() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('access_token');
  const authPersisted = localStorage.getItem('auth_persisted');
  const timestamp = localStorage.getItem('auth_timestamp');
  
  if (token && authPersisted && timestamp) {
    const authAge = Date.now() - parseInt(timestamp);
    // If token is less than 1 hour old, it's still valid
    if (authAge < 60 * 60 * 1000) {
      return true;
    }
  }
  
  return false;
}

export function clearAuthState() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('access_token');
  localStorage.removeItem('auth_timestamp');
  localStorage.removeItem('auth_persisted');
}