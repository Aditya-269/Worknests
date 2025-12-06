# OAuth Setup Guide for Google and GitHub Login

## Issues Found and Fixed

### 1. Missing OAuth Callback Pages
- ✅ Created `app/auth/google/callback/page.tsx`
- ✅ Created `app/auth/github/callback/page.tsx`

### 2. Missing Backend Token Exchange
- ✅ Added `github_token_exchange` endpoint in `backend/accounts/oauth_views.py`
- ✅ Added URL mapping for token exchange

### 3. Missing Environment Variables
- ✅ Updated `.env.example` with required OAuth variables

### 4. OAuth Integration in Forms
- ✅ Updated login form with OAuth functionality
- ✅ Added OAuth client imports and handlers

## Setup Instructions

### Frontend Environment Variables (.env.local)
```bash
# OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id-here
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Environment Variables (backend/.env)
```bash
# OAuth Provider Settings
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
```

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set Application type to "Web application"
6. Add these to Authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `https://yourdomain.com/auth/google/callback` (for production)
7. Copy Client ID and Client Secret

### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: Your App Name
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/auth/github/callback`
4. Copy Client ID and Client Secret

### Django Setup
1. Run migrations:
   ```bash
   cd backend
   python manage.py migrate
   ```

2. Create superuser (if not exists):
   ```bash
   python manage.py createsuperuser
   ```

3. Start Django server:
   ```bash
   python manage.py runserver
   ```

4. (Optional) Create Social Apps in Django Admin:
   - Go to `http://localhost:8000/admin/`
   - Navigate to "Social Applications"
   - Add Google and GitHub apps with your Client IDs and Secrets

### Testing the Setup
1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python manage.py runserver

   # Terminal 2 - Frontend  
   npm run dev
   ```

2. Go to `http://localhost:3000/login`
3. Try clicking "Continue with Google" or "Continue with GitHub"

## Troubleshooting

### Common Issues:

1. **"OAuth not configured" error**
   - Check environment variables are set correctly
   - Restart both servers after setting env vars

2. **"Invalid redirect URI" error**
   - Make sure redirect URIs match exactly in OAuth provider settings
   - Check that callback pages exist

3. **CORS errors**
   - Check `CORS_ALLOWED_ORIGINS` in Django settings
   - Make sure frontend URL is included

4. **"No authorization code received" error**
   - Check OAuth app configuration
   - Verify callback URLs are correct

### Debug Steps:
1. Check browser console for JavaScript errors
2. Check Django logs for backend errors
3. Verify environment variables are loaded
4. Test OAuth endpoints directly with curl/Postman

## Files Modified/Created:

### Created:
- `app/auth/google/callback/page.tsx`
- `app/auth/github/callback/page.tsx`
- `OAUTH_SETUP_GUIDE.md`

### Modified:
- `.env.example` - Added OAuth environment variables
- `backend/accounts/oauth_views.py` - Added GitHub token exchange
- `backend/accounts/urls.py` - Added token exchange URL
- `components/forms/LoginForm.tsx` - Fixed OAuth integration
- `components/forms/SignupForm.tsx` - Added OAuth imports
- `app/utils/oauth-client.ts` - Improved token handling

The OAuth login system should now work properly for both Google and GitHub authentication!