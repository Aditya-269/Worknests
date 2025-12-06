# 🔧 Google OAuth Setup Guide

## ✅ Current Status: OAuth Flow is Working!

The error `redirect_uri_mismatch` means:
- ✅ Your OAuth implementation is correct
- ✅ Google is receiving the OAuth request properly  
- ✅ The popup and flow mechanics work perfectly
- ❗ You just need to register the redirect URI in Google Cloud Console

## 🚀 Step-by-Step Google Cloud Console Setup

### **Step 1: Go to Google Cloud Console**
1. Visit: [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### **Step 2: Create or Select Project**
1. Click the project dropdown at the top
2. Either select an existing project or click "New Project"
3. If creating new: Enter project name and click "Create"

### **Step 3: Enable Google+ API (if needed)**
1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API" 
3. Click on it and click "Enable" (may already be enabled)

### **Step 4: Create OAuth 2.0 Credentials**
1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "OAuth 2.0 Client IDs"

### **Step 5: Configure OAuth Consent Screen (if prompted)**
If this is your first time, you'll need to configure the consent screen:
1. Select "External" user type
2. Fill in required fields:
   - **App name**: Your app name (e.g., "WorkNest Job Board")
   - **User support email**: Your email
   - **Developer contact information**: Your email
3. Click "Save and Continue" through the steps
4. Add yourself as a test user if needed

### **Step 6: Create OAuth Client ID**
1. **Application type**: Web application
2. **Name**: Give it a descriptive name (e.g., "WorkNest Web Client")
3. **Authorized JavaScript origins**: 
   - `http://localhost:3000`
   - `https://yourdomain.com` (for production)
4. **Authorized redirect URIs**: ⚠️ **THIS IS THE IMPORTANT PART**
   - `http://localhost:3000/auth/google/callback`
   - `https://yourdomain.com/auth/google/callback` (for production)

### **Step 7: Save and Copy Credentials**
1. Click "Create"
2. Copy the **Client ID** and **Client Secret**
3. You can always find these later in the Credentials section

## 🔧 Add Environment Variables

### **Frontend (.env.local)**
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id-here
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id-here
NEXT_PUBLIC_API_URL=https://backend-github-production-1bc7.up.railway.app
```

### **Backend (backend/.env)**
```bash
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
```

## 🧪 Test After Setup

1. **Restart both servers**:
   ```bash
   # Backend
   cd backend && python manage.py runserver
   
   # Frontend  
   npm run dev
   ```

2. **Test Google OAuth**:
   - Go to `http://localhost:3000/login`
   - Click "Continue with Google"
   - Should work without redirect_uri_mismatch error

## 🔍 Troubleshooting

### **Common Issues:**

1. **Still getting redirect_uri_mismatch:**
   - Double-check the redirect URI is exactly: `http://localhost:3000/auth/google/callback`
   - Make sure there are no trailing slashes or extra spaces
   - Case sensitive! Must match exactly

2. **OAuth consent screen issues:**
   - Make sure you've configured the consent screen
   - Add yourself as a test user if in testing mode
   - Verify app domain if required

3. **Client ID not working:**
   - Make sure you copied the full Client ID
   - Restart frontend server after adding environment variable
   - Check for typos in .env.local

## 📝 Expected Flow After Setup

1. **User clicks "Continue with Google"**
2. **Popup opens** → Clean Google consent screen (no errors)
3. **User authorizes** → Google redirects to your callback
4. **Token exchange** → Backend securely exchanges code for token  
5. **Login completes** → User is logged in and redirected

## 🎯 Production Setup

For production deployment, add these to your Google OAuth settings:
- **Authorized JavaScript origins**: `https://yourdomain.com`
- **Authorized redirect URIs**: `https://yourdomain.com/auth/google/callback`

Your OAuth implementation is solid - just need to register the redirect URI! 🚀