# 🚀 Vercel Deployment Guide

## ✅ Backend Successfully Pushed to GitHub

Repository: https://github.com/nimrithakur/Learning-Toolproj.git

## 📋 Steps to Deploy on Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
   
2. **Login** with your GitHub account

3. **Import Project**:
   - Click "Add New" → "Project"
   - Select your GitHub repository: `nimrithakur/Learning-Toolproj`
   - Click "Import"

4. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is, since we're deploying only backend)
   - **Build Command**: Leave empty or use `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   Click "Environment Variables" and add these:
   
   ```
   GEMINI_API_KEY=AIzaSyCGQZh1Gv9qbe-NL_5mRbiNok9n7UXOzJo
   NODE_ENV=production
   AI_MODEL=gemini-1.5-flash
   AI_TEMPERATURE=0.7
   MAX_TOKENS=2000
   CACHE_TTL=3600
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   PORT=3000
   ```

6. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - You'll get a URL like: `https://your-project.vercel.app`

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to backend folder
cd "/home/sama/Desktop/learning tool/backend"

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? learning-tool-backend
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add GEMINI_API_KEY
vercel env add NODE_ENV
vercel env add AI_MODEL
# ... add all other variables

# Deploy to production
vercel --prod
```

## 🔧 Post-Deployment Configuration

### 1. Update Frontend API URL

Once deployed, update your frontend's API endpoint to point to your Vercel URL.

In `frontend/script.js`, change:
```javascript
const API_BASE_URL = 'https://your-project.vercel.app/api';
```

### 2. Configure CORS (Optional)

For production, you may want to restrict CORS in `src/server.js`:
```javascript
app.use(cors({
    origin: ['https://your-frontend-domain.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
```

### 3. Test Your Deployment

```bash
# Test the API
curl https://your-project.vercel.app/api/health

# Or use Postman/Insomnia to test endpoints
```

## 📝 Important Notes

1. **Environment Variables**: 
   - Never commit `.env` file to Git
   - Always add them in Vercel Dashboard
   - Can be found in: Project Settings → Environment Variables

2. **Automatic Deployments**:
   - Every push to `main` branch will trigger automatic deployment
   - Can enable preview deployments for other branches

3. **Domain**:
   - Vercel provides a free `.vercel.app` domain
   - Can add custom domain in Project Settings

4. **Monitoring**:
   - View logs in Vercel Dashboard
   - Monitor function executions and errors

## 🔍 Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### Runtime Errors
- Check Function logs in Vercel Dashboard
- Verify environment variables are set correctly
- Check API key is valid

### CORS Issues
- Update CORS settings in `src/server.js`
- Add your frontend domain to allowed origins

## 📊 Vercel Features

- **Serverless Functions**: Backend runs as serverless functions
- **Automatic HTTPS**: SSL certificates included
- **Global CDN**: Fast response times worldwide
- **Analytics**: Built-in analytics dashboard
- **Zero Config**: Works out of the box with `vercel.json`

## 🎯 Next Steps

1. ✅ Code pushed to GitHub
2. 🚀 Deploy on Vercel (follow steps above)
3. 🔗 Get deployment URL
4. 🔧 Update frontend API endpoint
5. 🧪 Test all endpoints
6. 🌐 (Optional) Add custom domain

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: https://github.com/nimrithakur/Learning-Toolproj
- Vercel Docs: https://vercel.com/docs
