# 🚀 Render Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment

- [ ] Download/copy all the new files to your local project:
  - `render.yaml`
  - `build.sh`
  - `RENDER_DEPLOYMENT_GUIDE.md`
  - `RENDER_ENV_VARIABLES.md`
  - `DEPLOYMENT_CHECKLIST.md`

## Step 1: Git Setup

- [ ] Initialize git repository: `git init`
- [ ] Add all files: `git add .`
- [ ] Make initial commit: `git commit -m "Add Render deployment config"`
- [ ] Create new repository on GitHub
- [ ] Connect to GitHub: `git remote add origin [YOUR_REPO_URL]`
- [ ] Push to GitHub: `git push -u origin main`

## Step 2: Render Setup

- [ ] Create Render account at https://render.com
- [ ] Sign up with GitHub (recommended)
- [ ] Authorize Render to access GitHub repositories

## Step 3: Deploy with Blueprint

- [ ] Click "New +" → "Blueprint" in Render dashboard
- [ ] Connect your GitHub repository
- [ ] Verify render.yaml is detected
- [ ] Review services to be created (backend + database)
- [ ] Click "Apply" to start deployment
- [ ] Wait for deployment to complete (3-5 minutes)
- [ ] Copy your backend URL (e.g., `https://worknest-backend.onrender.com`)

## Step 4: Environment Variables

Set these in Render Dashboard → Your Service → Environment:

- [ ] `DEBUG` = `False`
- [ ] `ALLOWED_HOSTS` = `your-service-name.onrender.com` (without https://)
- [ ] `CORS_ALLOWED_ORIGINS` = `https://your-frontend.vercel.app,https://other-frontend.vercel.app`
- [ ] `GOOGLE_CLIENT_ID` = Your Google OAuth Client ID
- [ ] `GOOGLE_CLIENT_SECRET` = Your Google OAuth Secret
- [ ] `GITHUB_CLIENT_ID` = Your GitHub OAuth Client ID
- [ ] `GITHUB_CLIENT_SECRET` = Your GitHub OAuth Secret
- [ ] Verify `DJANGO_SECRET_KEY` is auto-generated
- [ ] Verify `DATABASE_URL` is auto-generated
- [ ] Click "Save Changes"

## Step 5: OAuth Configuration

### Google Cloud Console
- [ ] Go to https://console.cloud.google.com/apis/credentials
- [ ] Select your OAuth 2.0 Client ID
- [ ] Add redirect URI: `https://your-render-url.onrender.com/api/auth/google/callback/`
- [ ] Save changes

### GitHub OAuth App
- [ ] Go to https://github.com/settings/developers
- [ ] Select your OAuth App
- [ ] Update callback URL: `https://your-render-url.onrender.com/api/auth/github/callback/`
- [ ] Save changes

## Step 6: Frontend Update

- [ ] Go to Vercel dashboard
- [ ] Select your project
- [ ] Go to Settings → Environment Variables
- [ ] Update/Add `NEXT_PUBLIC_API_URL` = `https://your-render-url.onrender.com`
- [ ] Save changes
- [ ] Redeploy frontend (Deployments → ... → Redeploy)

## Step 7: Testing

- [ ] Visit backend admin: `https://your-render-url.onrender.com/admin/`
- [ ] Visit backend API: `https://your-render-url.onrender.com/api/`
- [ ] Test frontend login with Google
- [ ] Test frontend login with GitHub
- [ ] Create a test job posting
- [ ] Apply to a test job
- [ ] Verify all features work correctly

## Optional: Data Migration from Railway

If you need to migrate data from Railway:

- [ ] Export Railway database: `railway run pg_dump $DATABASE_URL > backup.sql`
- [ ] Import to Render (via Shell): `psql $DATABASE_URL < backup.sql`

## Troubleshooting

If you encounter issues:

- [ ] Check Render logs: Service Dashboard → Logs
- [ ] Verify all environment variables are set correctly
- [ ] Check CORS settings if getting CORS errors
- [ ] Verify OAuth redirect URIs match exactly (including trailing slash)
- [ ] Ensure ALLOWED_HOSTS doesn't include `https://` protocol
- [ ] Check database connection in logs
- [ ] Review RENDER_DEPLOYMENT_GUIDE.md for specific errors

## Post-Deployment

- [ ] Monitor first few requests (expect 30-60s cold start on free tier)
- [ ] Set up monitoring/alerts (optional)
- [ ] Document your backend URL for team
- [ ] Update project README with new backend URL
- [ ] Consider upgrading to paid plan if cold starts are an issue ($7/month)

---

## Quick Reference URLs

**Your URLs** (fill these in):
- Backend URL: `https://_____________________.onrender.com`
- Frontend URL: `https://_____________________.vercel.app`
- Admin Panel: `https://_____________________.onrender.com/admin/`

**External Services:**
- Render Dashboard: https://dashboard.render.com
- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- GitHub OAuth Apps: https://github.com/settings/developers
- Vercel Dashboard: https://vercel.com/dashboard

**Documentation:**
- Full Guide: `RENDER_DEPLOYMENT_GUIDE.md`
- Env Variables: `RENDER_ENV_VARIABLES.md`
- Render Docs: https://render.com/docs

---

## Notes

Add any deployment notes, issues, or important information here:

```
[Your notes here]
```

---

**Deployment Date:** _________________
**Deployed By:** _________________
**Backend URL:** _________________
**Status:** ☐ In Progress  ☐ Completed  ☐ Issues
