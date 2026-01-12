# Render Environment Variables Setup

Copy these environment variables to your Render web service dashboard.

## Required Environment Variables

### 1. DJANGO_SECRET_KEY
**Value**: Generate a new secret key at https://djecrety.ir/
```
Example: django-insecure-some-random-long-string-here
```

### 2. DEBUG
**Value**: `False`
```
False
```

### 3. DATABASE_URL
**Value**: Automatically provided by Render when you link the PostgreSQL database
```
(This will be auto-populated by Render)
```

### 4. ALLOWED_HOSTS
**Value**: Your Render service URL (without https://)
```
worknest-backend.onrender.com
```
*Note: Replace with your actual Render service name*

### 5. CORS_ALLOWED_ORIGINS
**Value**: Comma-separated list of your frontend URLs
```
https://worknests.vercel.app,https://worknests-git-main-aditya-269s-projects.vercel.app,https://worknests-aditya-269s-projects.vercel.app
```
*Note: Add any additional frontend domains you use*

### 6. GOOGLE_CLIENT_ID
**Value**: Your Google OAuth client ID from Google Cloud Console
```
your-google-client-id.apps.googleusercontent.com
```

### 7. GOOGLE_CLIENT_SECRET
**Value**: Your Google OAuth client secret from Google Cloud Console
```
your-google-client-secret
```

### 8. GITHUB_CLIENT_ID
**Value**: Your GitHub OAuth client ID
```
your-github-client-id
```

### 9. GITHUB_CLIENT_SECRET
**Value**: Your GitHub OAuth client secret
```
your-github-client-secret
```

## How to Set Environment Variables in Render

1. Go to your Render dashboard
2. Select your web service (worknest-backend)
3. Click on "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Enter the key and value for each variable above
6. Click "Save Changes"
7. Your service will automatically redeploy with the new variables

## After Setting Environment Variables

### Update OAuth Redirect URIs

**Google Cloud Console:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add to "Authorized redirect URIs":
   ```
   https://worknest-backend.onrender.com/api/auth/google/callback/
   ```

**GitHub OAuth App:**
1. Go to https://github.com/settings/developers
2. Select your OAuth App
3. Update "Authorization callback URL":
   ```
   https://worknest-backend.onrender.com/api/auth/github/callback/
   ```

*Note: Replace `worknest-backend.onrender.com` with your actual Render service URL*

### Update Frontend Environment Variables

Update your frontend (Vercel) environment variables:

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Update or add:
   ```
   NEXT_PUBLIC_API_URL=https://worknest-backend.onrender.com
   ```
   *Note: Replace with your actual Render backend URL*

## Quick Setup Checklist

- [ ] Set all 9 environment variables in Render
- [ ] Link PostgreSQL database to web service
- [ ] Update Google OAuth redirect URIs
- [ ] Update GitHub OAuth redirect URIs
- [ ] Update frontend API URL in Vercel
- [ ] Test authentication flow
- [ ] Verify API endpoints are accessible

## Testing Your Deployment

After deployment, test these endpoints:

1. **Health Check** (if you have one):
   ```
   https://worknest-backend.onrender.com/api/health/
   ```

2. **Admin Panel**:
   ```
   https://worknest-backend.onrender.com/admin/
   ```

3. **API Root**:
   ```
   https://worknest-backend.onrender.com/api/
   ```

## Troubleshooting

### "DisallowedHost" Error
- Check that `ALLOWED_HOSTS` includes your Render domain
- Ensure no protocol (https://) is included in ALLOWED_HOSTS

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URLs
- Make sure URLs include the protocol (https://)
- Check for typos in the URLs

### Database Connection Errors
- Ensure `DATABASE_URL` is set and correctly formatted
- Verify the PostgreSQL database is running
- Check database connection logs in Render

### OAuth Errors
- Verify redirect URIs are updated in Google/GitHub
- Check client IDs and secrets are correct
- Ensure callback URLs match exactly (including trailing slash)
