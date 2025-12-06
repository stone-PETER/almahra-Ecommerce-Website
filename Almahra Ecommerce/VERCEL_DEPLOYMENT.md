# Vercel Deployment Guide - Almahra E-commerce Frontend

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier works fine)
- Backend API deployed and accessible

---

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Commit all changes**
   ```bash
   cd "Almahra Ecommerce"
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Click "Add New" → "Project"

2. **Import Repository**
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Find and import `almahra-Ecommerce-Website`
   
3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `Almahra Ecommerce`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables** (Click "Environment Variables")
   
   Add these variables:
   
   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_API_URL` | Your backend API URL | Production |
   | `VITE_APP_ENV` | `production` | Production |
   
   Example backend URLs:
   - If backend on Heroku: `https://your-app.herokuapp.com`
   - If backend on AWS: `https://api.yourdomain.com`
   - If backend on Railway: `https://your-backend.railway.app`
   - **Important**: NO trailing slash, NO `/api` suffix

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-app.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd "Almahra Ecommerce"
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_URL
   # Enter your backend URL when prompted
   
   vercel env add VITE_APP_ENV
   # Enter: production
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 🔧 Configuration Details

### Environment Variables in Vercel

After deployment, you can manage environment variables:

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add/Edit variables as needed

**Required Variables:**
```env
VITE_API_URL=https://your-backend-api.com
VITE_APP_ENV=production
```

**Optional Variables:**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
VITE_AR_SERVICE_URL=https://your-ar-service.com
```

### Important Notes

1. **Backend URL Configuration**
   - Your backend must be deployed first
   - Backend must have CORS configured to allow Vercel domain
   - Update backend CORS to include: `https://your-app.vercel.app`

2. **API URL Format**
   - ✅ Correct: `https://api.yourbackend.com`
   - ❌ Wrong: `https://api.yourbackend.com/`
   - ❌ Wrong: `https://api.yourbackend.com/api`
   
   The `/api` suffix is added automatically in `src/services/api.js`

---

## 🔒 Backend CORS Configuration

Your Flask backend needs to allow requests from Vercel. Update your backend's CORS configuration:

**In `backend/.env.production`:**
```env
CORS_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

**Or in `backend/app/__init__.py`:**
```python
from flask_cors import CORS

CORS(app, origins=[
    "https://your-app.vercel.app",
    "https://your-custom-domain.com"
])
```

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain in Vercel

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `www.almahra-opticals.com`
4. Follow DNS configuration instructions
5. Add DNS records at your domain registrar:
   - **Type**: CNAME
   - **Name**: www (or @)
   - **Value**: cname.vercel-dns.com

---

## 🧪 Testing Your Deployment

### 1. Check Build Status
- Vercel Dashboard → Deployments
- Look for "Building" → "Ready"

### 2. Test the Live Site
```bash
# Your Vercel URL will be:
https://your-app.vercel.app

# Test these pages:
- Homepage: /
- Products: /products
- Admin Login: /admin/login
- Contact: /contact
```

### 3. Check API Connection
- Open browser console (F12)
- Navigate to any page
- Check for API errors
- Verify backend requests are going to correct URL

### 4. Common Issues

**Issue**: "Cannot connect to server"
- **Fix**: Check `VITE_API_URL` is set correctly in Vercel
- **Fix**: Ensure backend is running and accessible

**Issue**: CORS errors
- **Fix**: Update backend CORS to allow Vercel domain
- **Fix**: Check backend `.env.production` has correct CORS_ORIGINS

**Issue**: 404 on routes
- **Fix**: Already handled by `vercel.json` rewrites
- **Fix**: If still happening, verify `vercel.json` is in root

**Issue**: Images not loading
- **Fix**: Check image paths use relative URLs
- **Fix**: Verify images are in `public/` folder

---

## 📊 Monitoring & Analytics

### Vercel Analytics (Built-in)
1. Go to Project → Analytics
2. View page views, performance metrics
3. Track Core Web Vitals

### Add Google Analytics (Optional)
1. Get tracking ID from Google Analytics
2. Add to Vercel environment variables:
   ```
   VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
   ```

---

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to your Git repository:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Vercel will automatically:
# 1. Detect the push
# 2. Build your project
# 3. Deploy the new version
# 4. Update your live site (2-3 minutes)
```

### Preview Deployments
- Every branch gets a preview URL
- Create a branch: `git checkout -b feature/new-feature`
- Push: `git push origin feature/new-feature`
- Get preview URL: `https://your-app-git-feature-new-feature.vercel.app`

---

## 🛠️ Troubleshooting

### Build Fails

**Check build logs:**
1. Vercel Dashboard → Deployments → Click deployment
2. View build logs
3. Look for error messages

**Common build errors:**
```bash
# Missing dependencies
npm install

# Type errors (if using TypeScript)
npm run build  # Test locally first

# Environment variables missing
# Add them in Vercel Dashboard
```

### Runtime Errors

**Enable Vercel logs:**
1. Dashboard → Settings → Functions
2. Enable logging
3. View real-time logs

**Check browser console:**
- F12 → Console tab
- Look for API errors
- Check network requests

---

## 📝 Deployment Checklist

Before deploying:
- [ ] Backend API deployed and accessible
- [ ] Backend CORS configured for Vercel domain
- [ ] All environment variables prepared
- [ ] Code pushed to Git repository
- [ ] Build tested locally: `npm run build`
- [ ] Preview tested locally: `npm run preview`

After deploying:
- [ ] Verify homepage loads
- [ ] Test API connectivity
- [ ] Check admin login
- [ ] Test product pages
- [ ] Verify images load
- [ ] Check mobile responsiveness
- [ ] Test all navigation links
- [ ] Monitor error logs

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy.html
- **Support**: https://vercel.com/support

---

## 💡 Pro Tips

1. **Use Preview Deployments**
   - Test changes before merging to main
   - Share preview URLs with team/client

2. **Set Up Staging**
   - Create a `staging` branch
   - Configure separate environment variables
   - Use as pre-production environment

3. **Monitor Performance**
   - Check Vercel Analytics regularly
   - Optimize images and assets
   - Use lazy loading for routes

4. **Backup Plan**
   - Keep previous deployment URLs
   - Instant rollback available in Vercel
   - Dashboard → Deployments → Promote to Production

---

## 🎉 Success!

Your frontend is now live on Vercel! 

**Next Steps:**
1. Share the URL with your team
2. Test all features thoroughly
3. Set up custom domain (optional)
4. Configure backend to accept requests from your Vercel URL
5. Monitor analytics and error logs

**Your live app:** `https://your-app.vercel.app`

---

*Last updated: November 26, 2025*
