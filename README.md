# 🎯 Grant IQ Pro Edition

**Enterprise-Grade Grant Management Platform with AI-Powered Analysis**

[![Security Status](https://img.shields.io/badge/Security-Enterprise%20Grade-green)](./SECURITY_DEPLOYMENT_STATUS.md)
[![Deployment](https://img.shields.io/badge/Deploy-Render%20Ready-blue)](./DEPLOY_TO_RENDER.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

---

## 🚀 **Overview**

Grant IQ Pro Edition is a comprehensive, secure grant management platform that combines AI-powered grant discovery, eligibility analysis, team collaboration, and document management into a single, powerful solution.

### **✨ Key Features**

- 🔍 **AI Grant Discovery** - Automated grant search and matching
- 📊 **Eligibility Analysis** - Smart scoring and recommendations
- 👥 **Team Collaboration** - Real-time discussions and task management
- 📄 **Document Management** - Secure PDF processing and file handling
- 📈 **Analytics Dashboard** - Performance insights and reporting
- 🔒 **Enterprise Security** - Multi-layer protection and authentication

---

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │ FastAPI PDF     │
│   (Port 5174)   │────│   (Port 3000)    │────│ Service (8000)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
    ┌─────────┐          ┌─────────────┐        ┌─────────────┐
    │ Vite +  │          │ Express +   │        │ FastAPI +   │
    │ React   │          │ Security    │        │ pdfplumber  │
    └─────────┘          └─────────────┘        └─────────────┘
```

---

## 🔒 **Security Features**

✅ **Rate Limiting** - Multi-tier protection (Auth: 5/15min, Uploads: 10/hour)  
✅ **Input Validation** - Joi schemas with sanitization  
✅ **File Upload Security** - Magic byte validation, size limits  
✅ **Authentication** - JWT + bcrypt + role-based permissions  
✅ **CORS Protection** - Environment-based origins  
✅ **Analytics Protection** - Admin/manager access only  

**Security Audit**: [View Full Report](./FINAL_SECURITY_VERIFICATION.md)

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Python 3.8+ (for PDF service)
- Git

### **1. Clone & Install**
```bash
git clone https://github.com/YOUR_USERNAME/grant-iq-pro-edition.git
cd grant-iq-pro-edition

# Install backend dependencies
npm install

# Install frontend dependencies
cd sge-grant-dashboard
npm install
cd ..

# Install PDF service dependencies
pip3 install -r services/pdfProcessor/requirements.txt
```

### **2. Start Development Servers**
```bash
# Terminal 1: Backend
npm start

# Terminal 2: Frontend
cd sge-grant-dashboard && npm run dev

# Terminal 3: PDF Service (optional)
cd services/pdfProcessor && python3 main.py
```

### **3. Access Application**
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### **4. Demo Login**
```
Username: alan    | Password: admin123 (Admin)
Username: ursula  | Password: admin123 (Manager)
Username: sham    | Password: admin123 (Collaborator)
```

---

## 🌐 **Production Deployment**

### **🥇 Render.com (Recommended)**
One-click deployment with automatic configuration:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

[📖 Detailed Render Guide](./DEPLOY_TO_RENDER.md)

### **🥈 Alternative Platforms**
- [Vercel + Render](./DEPLOY_TO_VERCEL.md) - Ultra-fast frontend
- [Docker Deployment](./DEPLOY_TO_DOCKER.md) - Full control

---

## 📊 **Live Demo Data**

The application includes comprehensive demo data:

- **21 Grant Opportunities** - Real Australian grants
- **6 Team Members** - Diverse specializations
- **Active Task Pipeline** - PDF-to-task automation
- **Analytics Dashboard** - Performance metrics

---

## 🛠️ **Technology Stack**

### **Frontend**
- React 18 with Hooks & Context
- Vite for fast development
- Modern CSS with animations
- Responsive design

### **Backend**
- Node.js with Express
- JWT authentication
- Multi-tier rate limiting
- Comprehensive security middleware

### **Security**
- Helmet security headers
- CORS protection
- Input validation (Joi)
- File upload security
- Role-based access control

---

## 📁 **Project Structure**

```
grant-iq-pro-edition/
├── api/                    # Backend API endpoints
│   ├── auth.js            # Authentication & authorization
│   ├── grants.js          # Grant management
│   ├── analytics.js       # Analytics & reporting
│   └── ...
├── sge-grant-dashboard/   # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── views/         # Page-level components
│   │   └── utils/         # API client & utilities
├── services/              # Microservices
│   └── pdfProcessor/      # FastAPI PDF processing
├── middleware/            # Security & validation
├── mock/                  # Demo data
├── render.yaml           # Deployment configuration
└── docker-compose.yml    # Container orchestration
```

---

## 🔧 **Environment Configuration**

### **Required Variables**
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-32-character-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### **Optional Variables**
```bash
# Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Analytics
NOTIFICATION_EMAIL=admin@yourdomain.com
```

[📖 Full Environment Guide](./env.example)

---

## 📈 **Performance & Monitoring**

- **Health Checks**: `/health` endpoint
- **Error Handling**: Centralized middleware
- **Logging**: Structured application logs
- **Metrics**: Built-in analytics dashboard

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 **Documentation**

- [🚀 Deployment Guide](./DEPLOYMENT_COMPLETE.md)
- [🔒 Security Audit](./FINAL_SECURITY_VERIFICATION.md)
- [📖 API Documentation](./GPT_Check_Grant_IQ_Pro/API_DOCUMENTATION.md)
- [🐳 Docker Guide](./DEPLOY_TO_DOCKER.md)

---

## 📞 **Support**

- 📧 **Email**: support@grantiqpro.com
- 📖 **Documentation**: [Wiki](../../wiki)
- 🐛 **Issues**: [GitHub Issues](../../issues)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 **Acknowledgments**

- Built with security-first principles
- Designed for enterprise deployment
- Optimized for Australian grant ecosystem
- Community-driven development

---

**Grant IQ Pro Edition** - Empowering organizations to discover, analyze, and win more grants through intelligent automation and collaboration. 🚀

[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/grant-iq-pro-edition?style=social)](https://github.com/YOUR_USERNAME/grant-iq-pro-edition/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/grant-iq-pro-edition?style=social)](https://github.com/YOUR_USERNAME/grant-iq-pro-edition/network)
