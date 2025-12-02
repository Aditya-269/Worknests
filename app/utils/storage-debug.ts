// Debug utility to check storage state

export function debugStorage() {
  if (typeof window === 'undefined') return;
  
  console.log('=== STORAGE DEBUG ===');
  console.log('access_token:', localStorage.getItem('access_token') ? 'EXISTS' : 'MISSING');
  console.log('auth_timestamp:', localStorage.getItem('auth_timestamp'));
  console.log('auth_persisted:', localStorage.getItem('auth_persisted'));
  
  // Check if token is still valid format
  const token = localStorage.getItem('access_token');
  if (token) {
    try {
      const parts = token.split('.');
      console.log('Token parts count:', parts.length);
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const now = Date.now() / 1000;
        console.log('Token exp:', payload.exp, 'Now:', Math.floor(now), 'Valid:', payload.exp > now);
      }
    } catch (e) {
      console.log('Token decode error:', e);
    }
  }
  console.log('===================');
}