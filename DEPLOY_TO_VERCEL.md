# 🚀 Deploy to Vercel + Render (High Performance Option)

## Why This Combo?
- **Vercel**: Lightning-fast React app hosting with global CDN
- **Render**: Reliable backend API hosting with security features

## Step 1: Deploy Backend to Render
1. Push to GitHub
2. Connect to Render
3. Deploy backend service only
4. Note the backend URL: `https://grant-iq-pro-backend.onrender.com`

## Step 2: Deploy Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Import Project"**
3. Connect your GitHub repository
4. Set **Root Directory**: `sge-grant-dashboard`
5. Set environment variables:
```env
VITE_API_URL=https://grant-iq-pro-backend.onrender.com
```

## Step 3: Update CORS
Update your backend CORS settings to include Vercel domain:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', 
  'https://your-app.vercel.app',  // Add this
  process.env.CORS_ORIGIN
].filter(Boolean);
```

## Result
- **Frontend**: `https://your-app.vercel.app` (Ultra-fast)
- **Backend**: `https://grant-iq-pro-backend.onrender.com` (Secure)

## Benefits
✅ **Global CDN** for frontend  
✅ **99.99% uptime** for frontend  
✅ **Automatic deployments** on git push  
✅ **Free SSL certificates**  
✅ **Edge computing** performance  
