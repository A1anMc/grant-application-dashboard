# 🚀 Grant IQ Pro Edition - Production Deployment Guide

**Status**: ✅ **PRODUCTION READY** - All systems configured and tested

## 🎯 **Deployment Overview**

Your Grant IQ Pro Edition is configured for seamless deployment on **Render.com** with automatic builds, environment management, and production-grade infrastructure.

## 📋 **Services Configuration**

### **Backend Service** (`grant-iq-pro-backend`)
- **Type**: Web Service (Node.js)
- **Build**: `npm install` 
- **Start**: `node server.js`
- **URL**: `https://grant-iq-pro-backend.onrender.com`

### **Frontend Service** (`grant-iq-pro-frontend`)
- **Type**: Web Service (Static Site)
- **Build**: `cd sge-grant-dashboard && npm install && npm run build`
- **URL**: `https://grant-iq-pro-frontend.onrender.com`

## 🚀 **Deploy to Render (Recommended)**

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Production deployment ready"
git push origin main
```

### **Step 2: Deploy Backend**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create **TWO services**
5. Set environment variables for backend:

```env
NODE_ENV=production
PORT=3000
NOTIFICATION_EMAIL=admin@shadowgoose.com
EMAIL_FROM=noreply@shadowgoose.com
CORS_ORIGIN=https://grant-iq-pro-frontend.onrender.com
```

### **Step 3: Deploy Frontend**
The frontend service will automatically:
- Build the React app with Vite
- Connect to the backend API
- Serve the production build

### **Step 4: Configure Environment Variables**
For the **frontend service**, set:
```env
NODE_ENV=production
VITE_API_URL=https://grant-iq-pro-backend.onrender.com
```

---

## 🔧 **Environment Variables Setup**

### **Backend (.env)**
```env
NODE_ENV=production
PORT=3000
NOTIFICATION_EMAIL=admin@shadowgoose.com
EMAIL_FROM=noreply@shadowgoose.com
CORS_ORIGIN=https://grant-iq-pro-frontend.onrender.com

# Optional: Email Service (for real notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Frontend (Render Environment Variables)**
```env
VITE_API_URL=https://grant-iq-pro-backend.onrender.com
VITE_APP_NAME=Shadow Goose Grant Portal
```

---

## 🌐 **Alternative Deployment Options**

### **Option 1: Vercel (Frontend) + Render (Backend)**
- Deploy React app to Vercel
- Deploy API to Render
- Update `VITE_API_URL` to point to Render backend

### **Option 2: Railway**
- Similar to Render
- Use the same `render.yaml` structure
- Set same environment variables

### **Option 3: DigitalOcean App Platform**
- Upload your code
- Configure build commands from `render.yaml`
- Set environment variables

---

## 📊 **Production Features**

### **✅ Fully Functional:**
- 17 grants management (mock + manual + discovered)
- Real-time analytics dashboard
- Smart notification system
- Manual grant entry system
- Grant discovery automation
- Modern responsive UI

### **🎯 Production URLs:**
- **Frontend**: `https://grant-iq-pro-frontend.onrender.com`
- **Backend API**: `https://grant-iq-pro-backend.onrender.com/api/grants`
- **Health Check**: `https://grant-iq-pro-backend.onrender.com/health`

---

## 🚨 **Pre-Deployment Checklist**

### **✅ Ready:**
- [x] Code is functional locally
- [x] Environment variables configured
- [x] CORS settings updated
- [x] API endpoints working
- [x] React build process working
- [x] Health checks implemented

### **📧 Optional (Email Setup):**
- [ ] Gmail App Password for notifications
- [ ] SMTP server configuration
- [ ] SendGrid API key (alternative)

---

## 🎉 **Deploy Now!**

Your system is **100% ready for production deployment**. 

**Quick Deploy Command:**
```bash
# Commit your changes
git add .
git commit -m "Ready for production deployment"
git push origin main

# Then go to Render Dashboard and connect your repo
```

**Expected Timeline:**
- Backend deployment: ~3-5 minutes
- Frontend deployment: ~5-8 minutes
- Total setup time: ~10-15 minutes

**You'll have two live URLs:**
- **Main App**: `https://grant-iq-pro-frontend.onrender.com`
- **API**: `https://grant-iq-pro-backend.onrender.com`

---

## 🛠️ **Post-Deployment**

After deployment, you can:
1. **Add real grants** through the web interface
2. **Set up email notifications** (optional)
3. **Configure grant discovery automation**
4. **Customize branding and content**
5. **Scale as needed**

**Your Grant IQ Pro Edition Grant Management System is production-ready!** 🚀 