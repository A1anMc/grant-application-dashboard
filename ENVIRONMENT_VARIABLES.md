# 🔧 Environment Variables Guide - Grant IQ Pro Edition

## 📋 **Quick Setup**

### **Local Development**
Your `.env` file is already configured for local development:
```bash
NODE_ENV=development
PORT=3000
JWT_SECRET=1dadb68f613e16ebbfba10fc65125738acc52d2d0d2b8a43b7fb875a31dfb91a
CORS_ORIGIN=http://localhost:5174
VITE_API_URL=http://localhost:3000
```

### **Production Deployment (Render.com)**
Add these in your Render dashboard:
```bash
NODE_ENV=production
JWT_SECRET=1dadb68f613e16ebbfba10fc65125738acc52d2d0d2b8a43b7fb875a31dfb91a
CORS_ORIGIN=https://grant-iq-pro-frontend.onrender.com
VITE_API_URL=https://grant-iq-pro-backend.onrender.com
```

---

## 🔑 **Required Variables**

### **JWT_SECRET** (Critical)
- **Purpose**: Secures user authentication tokens
- **Local**: Already set in your `.env`
- **Production**: `1dadb68f613e16ebbfba10fc65125738acc52d2d0d2b8a43b7fb875a31dfb91a`
- **Note**: This is a secure 32-character hex string

### **CORS_ORIGIN** (Critical)
- **Purpose**: Allows frontend to communicate with backend
- **Local**: `http://localhost:5174`
- **Production**: `https://grant-iq-pro-frontend.onrender.com`

### **VITE_API_URL** (Frontend)
- **Purpose**: Tells React app where to find the API
- **Local**: `http://localhost:3000`
- **Production**: `https://grant-iq-pro-backend.onrender.com`

---

## 📧 **Optional Email Variables**

If you want email notifications (deadline alerts, etc.):

### **Gmail Setup**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
NOTIFICATION_EMAIL=admin@yourdomain.com
```

### **SendGrid Setup** (Professional)
```bash
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
NOTIFICATION_EMAIL=admin@yourdomain.com
```

---

## 🚀 **Render.com Deployment Steps**

### **Step 1: Backend Service Environment Variables**
In Render dashboard, add:
```bash
NODE_ENV=production
JWT_SECRET=1dadb68f613e16ebbfba10fc65125738acc52d2d0d2b8a43b7fb875a31dfb91a
CORS_ORIGIN=https://grant-iq-pro-frontend.onrender.com
NOTIFICATION_EMAIL=admin@yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
```

### **Step 2: Frontend Service Environment Variables**
In Render dashboard, add:
```bash
NODE_ENV=production
VITE_API_URL=https://grant-iq-pro-backend.onrender.com
VITE_APP_NAME=Grant IQ Pro Edition
VITE_APP_VERSION=1.0.0
```

---

## 🔧 **Variable Explanations**

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Server port (auto-set by Render) | No | `3000` |
| `JWT_SECRET` | Authentication security | Yes | `1dadb68f...` |
| `CORS_ORIGIN` | Frontend domain | Yes | `https://...` |
| `VITE_API_URL` | API endpoint for frontend | Yes | `https://...` |
| `SMTP_HOST` | Email server | No | `smtp.gmail.com` |
| `SMTP_USER` | Email username | No | `you@gmail.com` |
| `SMTP_PASS` | Email password/app password | No | `your-app-pass` |
| `NOTIFICATION_EMAIL` | Admin email | No | `admin@domain.com` |

---

## ⚠️ **Security Notes**

### **Never Commit Secrets**
- ✅ `.env` is in `.gitignore` (local secrets safe)
- ✅ Use Render dashboard for production secrets
- ❌ Never put real secrets in `env.example`

### **JWT_SECRET Security**
- Must be at least 32 characters
- Use random hex string (provided one is secure)
- Change for production if desired

### **CORS Security**
- Never use `*` for CORS_ORIGIN in production
- Always specify exact frontend domain

---

## 🧪 **Testing Your Configuration**

### **Local Test**
```bash
# Start backend
npm start

# Start frontend (new terminal)
cd sge-grant-dashboard && npm run dev

# Test API connection
curl http://localhost:3000/health
```

### **Production Test**
```bash
# Test backend
curl https://grant-iq-pro-backend.onrender.com/health

# Test frontend
# Open: https://grant-iq-pro-frontend.onrender.com
```

---

## 🎯 **Ready to Deploy!**

Your environment variables are now properly configured:
- ✅ **Local development** ready
- ✅ **Production values** ready for Render
- ✅ **Security** properly configured
- ✅ **Email features** ready to enable

**Go deploy to Render.com with confidence!** 🚀
