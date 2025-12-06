# 🚀 Vercel Deployment - Quick Checklist

## ✅ Pre-Deployment Checklist

### 1. Files Created ✅
- [x] `vercel.json` - Vercel configuration
- [x] `.vercelignore` - Files to exclude from deployment
- [x] `.env.production` - Production environment variables (updated)
- [x] `VERCEL_DEPLOYMENT.md` - Complete deployment guide

### 2. Test Locally First
```bash
cd "Almahra Ecommerce"

# Install dependencies
npm install

# Build the project
npm run build

# Preview production build locally
npm run preview
```

Visit `http://localhost:4173` and test:
- [ ] Homepage loads
- [ ] Products page works
- [ ] Admin login accessible
- [ ] Navigation works
- [ ] Images display correctly

---

## 🌐 Deploy to Vercel (5 Minutes)

### Method 1: Vercel Dashboard (Easiest)

1. **Visit Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub/GitLab/Bitbucket

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your repository: `almahra-Ecommerce-Website`

3. **Configure Settings**
   ```
   Framework Preset: Vite
   Root Directory: Almahra Ecommerce
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_API_URL = http://almahra-prod.eba-hzbjvccf.ap-south-1.elasticbeanstalk.com
   VITE_APP_ENV = production
   ```

5. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! 🎉

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd "Almahra Ecommerce"
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? almahra-ecommerce
# - Directory? ./
# - Override settings? No

# Set environment variables
vercel env add VITE_API_URL production
# Paste: http://almahra-prod.eba-hzbjvccf.ap-south-1.elasticbeanstalk.com

vercel env add VITE_APP_ENV production
# Enter: production

# Deploy to production
vercel --prod
```

---

## 🔧 Post-Deployment

### 1. Update Backend CORS

Your backend needs to allow requests from Vercel. Update backend CORS:

**Option A: Environment Variable**
```bash
# In your AWS Elastic Beanstalk environment
# Add environment variable:
CORS_ORIGINS=https://your-app.vercel.app
```

**Option B: Code Update**
```python
# backend/app/__init__.py
from flask_cors import CORS

CORS(app, origins=[
    "https://your-app.vercel.app",  # Your Vercel URL
    "https://your-custom-domain.com"  # If using custom domain
])
```

### 2. Test Live Site

Visit your Vercel URL: `https://your-app.vercel.app`

Test these features:
- [ ] Homepage loads
- [ ] Products page with API data
- [ ] Admin login (check console for API errors)
- [ ] Images and styling work
- [ ] Mobile responsive

### 3. Check Console for Errors

Open browser console (F12):
- [ ] No CORS errors
- [ ] API requests succeed
- [ ] No 404 errors

---

## 🎨 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `www.almahra-opticals.com`
4. Add DNS records at your domain registrar:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build

# Check error message
# Common issues:
# - Missing dependencies: npm install
# - TypeScript errors: Check build logs
```

### CORS Errors
```bash
# Backend must allow your Vercel domain
# Update CORS_ORIGINS in backend
```

### API Not Connecting
```bash
# Check environment variable in Vercel Dashboard
# Settings → Environment Variables
# Verify VITE_API_URL is correct (no trailing slash)
```

### 404 on Routes
```bash
# Should be fixed by vercel.json
# If not, verify vercel.json is in "Almahra Ecommerce" folder
```

---

## 📊 After Deployment

### Monitor Your App
- **Analytics**: Vercel Dashboard → Analytics
- **Logs**: Vercel Dashboard → Deployments → View Function Logs
- **Performance**: Check Core Web Vitals

### Continuous Deployment
Every push to main branch auto-deploys:
```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel auto-deploys in 2-3 minutes
```

---

## 🎉 Success Indicators

✅ Build completes without errors  
✅ Site loads at Vercel URL  
✅ No console errors  
✅ API calls work (check Network tab)  
✅ Admin login successful  
✅ Products load from backend  

---

## 📞 Need Help?

See detailed guide: `VERCEL_DEPLOYMENT.md`

Common commands:
```bash
# Redeploy
vercel --prod

# View logs
vercel logs

# View domains
vercel domains

# View environment variables
vercel env ls
```

---

**Your app will be live at:** `https://your-project-name.vercel.app`

Enjoy your deployed frontend! 🚀
