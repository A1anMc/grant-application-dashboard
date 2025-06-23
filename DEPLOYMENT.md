# 🚀 Shadow Goose Grant Portal - Render Deployment Guide

## Quick Deploy to Render

### 1. **Connect Repository**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `A1anMc/grant-application-dashboard`
4. Select the `main` branch

### 2. **Configure Service**
Render will automatically detect the `render.yaml` configuration, but verify these settings:

- **Name**: `shadow-goose-grant-portal`
- **Runtime**: `Node`
- **Build Command**: `cd frontend && npm ci && npm run build`
- **Start Command**: `cd frontend && npm start`
- **Port**: Auto-detected from `$PORT`

### 3. **Set Environment Variables**
In the Render dashboard, add these environment variables:

```bash
NODE_ENV=production
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To get Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 4. **Deploy**
1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Your app will be available at: `https://shadow-goose-grant-portal.onrender.com`

---

## 🎯 Demo Mode

The app includes a demo mode that works without Supabase:
- **Demo URL**: `https://your-app.onrender.com?demo=true`
- **Features**: Full functionality with mock data
- **Perfect for**: Testing, presentations, and showcasing

---

## 🛠️ Manual Deployment Steps

If you prefer manual setup:

### 1. Fork & Clone
```bash
git clone https://github.com/A1anMc/grant-application-dashboard.git
cd grant-application-dashboard
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Build
```bash
npm run build
```

### 4. Test Locally
```bash
npm start
# App runs on http://localhost:3000
```

### 5. Deploy to Render
- Push to your GitHub repository
- Follow the "Connect Repository" steps above

---

## 🔧 Configuration Files

### `render.yaml`
Render service configuration:
- **Build**: Installs dependencies and builds the React app
- **Start**: Serves the built app with Express
- **Environment**: Production settings
- **Health Check**: Monitors app availability

### `frontend/server.js`
Express server that:
- Serves static files from `dist/`
- Handles client-side routing (SPA)
- Listens on Render's assigned port

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Check build locally
cd frontend
npm run build
```

### App Won't Start
- Verify environment variables are set
- Check Render logs for errors
- Ensure Node.js version compatibility

### Supabase Connection Issues
- Verify VITE_SUPABASE_URL format: `https://your-project.supabase.co`
- Check anon key is correctly copied
- Use demo mode for testing: `?demo=true`

### Demo Mode Not Working
- Clear browser cache
- Check URL parameter: `?demo=true`
- Verify console for demo mode logs

---

## 📊 App Features

✅ **Grant Discovery Dashboard** - Australian grant opportunities  
✅ **My Grants Workspace** - Kanban-style grant management  
✅ **Document Manager** - File upload and organization  
✅ **AI Grant Writer** - Intelligent response generation  
✅ **Analytics Dashboard** - Grant performance insights  
✅ **First Nations Partnerships** - Enhanced eligibility scoring  

---

## 🎉 Success!

Once deployed, your Grant Portal will be available at:
`https://shadow-goose-grant-portal.onrender.com`

**Demo Mode**: Add `?demo=true` to the URL for instant access with sample data.

---

*Need help? Check the [main README](README.md) or open an issue on GitHub.* 