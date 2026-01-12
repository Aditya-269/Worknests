# 🆓 Render Free Tier Manual Deployment (No Credit Card Needed)

Since Blueprint requires payment information, here's how to deploy using Render's free tier **without** entering payment details.

## ✅ What You Get (100% FREE):

- PostgreSQL Database (90 days retention)
- Web Service (750 hours/month)
- No credit card required for initial setup
- Services spin down after 15 minutes of inactivity

---

## 📋 Step-by-Step Manual Deployment

### STEP 1: Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `worknest-db`
   - **Database**: `worknest`
   - **User**: `worknest` (optional)
   - **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
   - **Instance Type**: **Free** (select this!)
4. Click **"Create Database"**
5. Wait 2-3 minutes for database creation
6. **IMPORTANT**: Copy the **"Internal Database URL"** from the database info page
   - It looks like: `postgresql://worknest:xxxxx@dpg-xxxxx/worknest`
   - You'll need this for the web service!

---

### STEP 2: Create Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect account"** if needed
   - Select: **Aditya-269/Worknests**
3. Configure the service:

   **Basic Settings:**
   - **Name**: `worknest-backend` (or your preferred name)
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: **Python 3**
   - **Instance Type**: **Free** ⭐ (IMPORTANT!)

   **Build & Deploy:**
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
     ```
   
   - **Start Command**:
     ```bash
     gunicorn worknest.wsgi:application
     ```

4. Scroll down to **"Advanced"** and click it

---

### STEP 3: Set Environment Variables

In the "Environment Variables" section, add these one by one:

#### Required Variables:

1. **DATABASE_URL**
   - Value: Paste the Internal Database URL from Step 1
   - Example: `postgresql://worknest:xxxxx@dpg-xxxxx/worknest`

2. **DJANGO_SECRET_KEY**
   - Generate one at: https://djecrety.ir/
   - Value: Your generated secret key

3. **DEBUG**
   - Value: `False`

4. **ALLOWED_HOSTS**
   - Value: `worknest-backend.onrender.com` (or your service name)
   - ⚠️ Update this after deployment with your actual URL

5. **CORS_ALLOWED_ORIGINS**
   - Value: Your frontend URLs (comma-separated)
   - Example: `https://worknests.vercel.app,https://worknests-git-main-aditya-269s-projects.vercel.app`

6. **GOOGLE_CLIENT_ID**
   - Value: Your Google OAuth Client ID

7. **GOOGLE_CLIENT_SECRET**
   - Value: Your Google OAuth Client Secret

8. **GITHUB_CLIENT_ID**
   - Value: Your GitHub OAuth Client ID

9. **GITHUB_CLIENT_SECRET**
   - Value: Your GitHub OAuth Client Secret

---

### STEP 4: Deploy

1. After setting all environment variables, click **"Create Web Service"**
2. Render will start building and deploying (5-10 minutes)
3. Watch the logs for any errors
4. Once deployed, you'll see your URL at the top:
   - Example: `https://worknest-backend.onrender.com`

---

### STEP 5: Update ALLOWED_HOSTS

1. Go back to your service's **"Environment"** tab
2. Edit **ALLOWED_HOSTS**
3. Update with your actual Render URL (without https://)
   - Example: `worknest-backend.onrender.com`
4. Click **"Save Changes"**
5. Service will automatically redeploy

---

### STEP 6: Update OAuth Redirect URIs

Now that you have your Render URL, update OAuth settings:

**Google Cloud Console:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add to "Authorized redirect URIs":
   ```
   https://your-render-url.onrender.com/api/auth/google/callback/
   ```
4. Click "Save"

**GitHub OAuth App:**
1. Go to https://github.com/settings/developers
2. Select your OAuth App
3. Update "Authorization callback URL":
   ```
   https://your-render-url.onrender.com/api/auth/github/callback/
   ```
4. Click "Update application"

---

### STEP 7: Update Frontend

Update your Vercel environment variables:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Update/Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com
   ```
5. Redeploy your frontend

---

## 🎯 Free Tier Limitations

### What to Expect:

**Cold Starts:**
- Services spin down after 15 minutes of inactivity
- First request after spin down takes **30-60 seconds**
- Subsequent requests are fast

**Database:**
- 256 MB storage (should be enough for small projects)
- 90 days data retention
- Connection pooling limited

**Web Service:**
- 512 MB RAM
- 0.1 CPU
- 750 hours/month runtime
- Good for development and small projects

### Tips for Free Tier:

1. **Keep service warm**: Use a cron job or Uptime Robot to ping your service every 10 minutes
2. **Optimize cold starts**: Keep your dependencies minimal
3. **Monitor usage**: Check your dashboard regularly
4. **Backup data**: Export database weekly (free tier = 90 days retention)

---

## 🔧 Troubleshooting

### Build Fails

**Check these:**
- Root directory is set to `backend`
- `requirements.txt` exists in backend folder
- Python version compatibility
- Check build logs for specific errors

### Database Connection Error

**Check:**
- DATABASE_URL is correct (Internal URL, not External)
- Database is running
- Security rules (Render free tier allows all connections)

### 502 Bad Gateway

**Possible causes:**
- Service still building/deploying
- Out of memory (free tier = 512MB)
- Application crashed (check logs)
- Port not configured (Render auto-configures)

### OAuth Not Working

**Check:**
- Redirect URIs updated in Google/GitHub
- Client IDs and secrets are correct
- URLs match exactly (including trailing slash)
- CORS_ALLOWED_ORIGINS includes your frontend

---

## 📊 Monitoring

**View Logs:**
- Service Dashboard → Logs tab
- Real-time streaming
- Search and filter available

**Metrics:**
- Service Dashboard → Metrics tab
- CPU, Memory, Request volume
- Response times

**Events:**
- Service Dashboard → Events tab
- Deploy history
- Configuration changes

---

## 💡 Alternative Free Hosting Options

If Render doesn't work out, here are other free options:

### 1. **Railway (New Account)**
- 500 hours free trial
- No credit card needed initially
- Similar to Render
- https://railway.app

### 2. **Fly.io**
- Generous free tier
- Good for Django apps
- Credit card required (but free tier is truly free)
- https://fly.io

### 3. **PythonAnywhere**
- Free tier available
- Good for Django
- Some limitations on packages
- https://www.pythonanywhere.com

### 4. **Heroku (with GitHub Student Pack)**
- Free through GitHub Student Pack
- $13/month credit
- https://education.github.com/pack

### 5. **Google Cloud Platform (Student)**
- $300 free credits for students
- Apply with student email
- https://cloud.google.com/edu/students

### 6. **DigitalOcean (Student)**
- $200 credit via GitHub Student Pack
- 1 year free
- https://education.github.com/pack

### 7. **Supabase (Database)**
- Free PostgreSQL database
- 500MB storage
- Use with any hosting
- https://supabase.com

---

## 🎓 GitHub Student Developer Pack

**Highly Recommended!** Get free access to premium services:

1. Go to: https://education.github.com/pack
2. Verify student status (upload student ID or use school email)
3. Get access to:
   - Heroku: $13/month credit
   - DigitalOcean: $200 credit
   - MongoDB Atlas: Free tier
   - Stripe: Waived transaction fees
   - And 100+ other tools!

---

## 📝 Summary

✅ **Free Tier is Sufficient For:**
- Student projects
- Portfolio websites
- Low-traffic applications
- Development/testing environments

❌ **Consider Paid/Alternative When:**
- Need always-on service (no cold starts)
- High traffic expected
- Production application
- Need more resources

---

## 🆘 Need Help?

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Check logs in Render dashboard
- Review RENDER_DEPLOYMENT_GUIDE.md for more details

---

**Good luck with your deployment! 🚀**
