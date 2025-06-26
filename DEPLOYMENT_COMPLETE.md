# 🚀 Grant IQ Pro Edition - Complete Deployment Guide

## 📋 System Overview

Grant IQ Pro Edition is a comprehensive full-stack grant management platform that merges:
- **Grant Discovery**: AI-powered grant search and matching
- **Eligibility Analysis**: Automated scoring and recommendations  
- **Task Planning**: PDF-to-task extraction and team assignment
- **Team Collaboration**: Real-time discussions and document sharing
- **Document Management**: Versioned file storage with tagging
- **Analytics Dashboard**: Performance insights and reporting

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │ FastAPI PDF     │
│   (Port 5174)   │────│   (Port 3000)    │────│ Service (8000)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌─────────┐          ┌─────────────┐        ┌─────────────┐
    │ Static  │          │ File Storage│        │ PDF Parser  │
    │ Assets  │          │ & Mock Data │        │ & AI Tasks  │
    └─────────┘          └─────────────┘        └─────────────┘
```

## 🔧 Technology Stack

### Frontend
- **React 18** with Hooks and Context
- **React Router** for navigation
- **CSS3** with modern layouts and animations
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **JWT** authentication with bcrypt
- **Multer** for file uploads
- **CORS** enabled for cross-origin requests

### PDF Processing
- **FastAPI** Python service
- **pdfplumber** for text extraction
- **AI task generation** engine

### Data Storage
- **JSON files** for development/demo
- **File system** for document storage
- **Ready for database** integration

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- npm or yarn

### 1. Install Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd sge-grant-dashboard
npm install
cd ..

# Python dependencies for PDF service
pip3 install -r services/pdfProcessor/requirements.txt
```

### 2. Start Services
```bash
# Terminal 1: Start backend
PORT=3000 node server.js

# Terminal 2: Start frontend  
cd sge-grant-dashboard
npm run dev

# Terminal 3: Start PDF service
cd services/pdfProcessor
python3 main.py
```

### 3. Access Application
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000
- **PDF Service**: http://localhost:8000

### 4. Demo Login
- **Username**: `alan` / **Password**: `admin123` (Admin)
- **Username**: `ursula` / **Password**: `admin123` (Manager)
- **Username**: `sham` / **Password**: `admin123` (Collaborator)

## 🐳 Docker Deployment

### Build and Run
```bash
# Build the application
docker build -t grant-iq-pro .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production with Nginx
```bash
# Start with production profile
docker-compose --profile production up -d
```

## ☁️ Cloud Deployment

### Render.com (Recommended)
1. Connect your GitHub repository
2. Set build command: `npm install && cd sge-grant-dashboard && npm install && npm run build`
3. Set start command: `node server.js`
4. Add environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secret-key`

### Heroku
```bash
# Install Heroku CLI and login
heroku create grant-iq-pro-your-name

# Set buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/python

# Deploy
git push heroku main
```

### AWS/Google Cloud
- Use the provided Dockerfile
- Set up load balancer for port 3000
- Configure environment variables
- Set up file storage (S3/Cloud Storage)

## 🔐 Security Configuration

### Environment Variables
```bash
# Required
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Optional
CORS_ORIGIN=https://your-domain.com
PDF_SERVICE_URL=http://localhost:8000
DATABASE_URL=your-database-connection-string
```

### Production Checklist
- [ ] Change default JWT secret
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for your domain
- [ ] Set up database (PostgreSQL/MongoDB)
- [ ] Enable file upload limits
- [ ] Set up backup strategy
- [ ] Configure logging
- [ ] Set up monitoring

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/demo-login` - Demo login
- `GET /api/auth/me` - Get current user

### Grants
- `GET /api/grants` - List all grants
- `GET /api/grant-details/:id` - Detailed grant analysis
- `POST /api/grants` - Create new grant
- `PUT /api/grants/:id` - Update grant

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List documents
- `GET /api/documents/:id/download` - Download document
- `DELETE /api/documents/:id` - Delete document

### Collaboration
- `POST /api/collaboration/discussions` - Create discussion
- `GET /api/collaboration/discussions` - List discussions
- `POST /api/collaboration/discussions/:id/comments` - Add comment

### Analytics
- `GET /api/analytics/dashboard` - Get analytics data
- `GET /api/analytics/export` - Export data

### PDF Processing
- `POST /api/pdf/upload` - Upload and analyze PDF
- `POST /api/pdf/extract-tasks` - Extract tasks from PDF
- `GET /api/pdf/health` - Service health check

## 🎯 Features Overview

### 1. Grant Discovery
- **Search & Filter**: Advanced filtering by category, deadline, amount
- **AI Matching**: Relevance scoring based on organization profile
- **Auto-Discovery**: Scheduled scraping of grant databases
- **Manual Entry**: Add custom grants and opportunities

### 2. Eligibility Analysis
- **AI Scoring**: 5-factor analysis (Alignment, Experience, Capacity, Innovation, Impact)
- **Risk Assessment**: Low/Medium/High risk categorization
- **Recommendations**: Actionable next steps
- **Detailed Breakdown**: Category-specific scoring

### 3. Task Planning Engine
- **PDF Analysis**: Extract requirements from grant documents
- **Auto-Task Generation**: Create structured task lists
- **Team Assignment**: Assign tasks to team members
- **Progress Tracking**: Visual kanban-style board

### 4. Team Collaboration
- **Discussion Threads**: Grant and task-specific conversations
- **Real-time Comments**: Threaded discussions with mentions
- **Activity Feed**: Track team activity and updates
- **Role-based Access**: Admin, Manager, Collaborator, Viewer roles

### 5. Document Vault
- **Secure Upload**: Multi-file drag-and-drop upload
- **Version Control**: Track document versions
- **Smart Tagging**: Categorize and tag documents
- **Search & Filter**: Find documents quickly
- **Preview & Download**: View and download files

### 6. Analytics Dashboard
- **Performance Metrics**: Win rates, success tracking
- **Financial Insights**: Grant values and trends
- **Team Performance**: Task completion rates
- **Deadline Tracking**: Upcoming deadlines and alerts
- **Export Capability**: CSV and JSON export

## 🔧 Customization

### Adding New Grant Sources
1. Create scraper in `scripts/` directory
2. Add to `grant_discovery_scheduler.js`
3. Update grant data structure in `mock/mockGrants.json`

### Custom Eligibility Criteria
1. Modify `api/eligibility.js`
2. Update scoring algorithms
3. Add new assessment factors

### Team Roles & Permissions
1. Update `api/auth.js` ROLES and PERMISSIONS
2. Add role-based UI components
3. Update middleware for endpoint protection

### UI Themes
1. Modify CSS variables in `src/index.css`
2. Update color schemes in component CSS
3. Add theme switching functionality

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 node server.js
```

**PDF Service Not Starting**
```bash
# Check Python dependencies
pip3 install -r services/pdfProcessor/requirements.txt

# Test PDF service directly
cd services/pdfProcessor
python3 main.py
```

**Frontend Build Errors**
```bash
# Clear cache and reinstall
cd sge-grant-dashboard
rm -rf node_modules package-lock.json
npm install
```

**Authentication Issues**
- Check JWT_SECRET is set
- Verify user data in `mock/users.json`
- Clear browser localStorage

### Performance Optimization
- Enable gzip compression
- Implement Redis caching
- Optimize database queries
- Use CDN for static assets

## 📈 Scaling Considerations

### Database Migration
- Replace JSON files with PostgreSQL/MongoDB
- Implement connection pooling
- Add database migrations

### File Storage
- Move to cloud storage (AWS S3, Google Cloud)
- Implement CDN for document delivery
- Add file compression

### Microservices
- Separate PDF service deployment
- Add message queue (Redis/RabbitMQ)
- Implement service discovery

### Monitoring
- Add application monitoring (New Relic, DataDog)
- Implement health checks
- Set up alerting

## 🎉 Success Metrics

After deployment, you'll have:
- ✅ **Complete Grant Management Platform**
- ✅ **AI-Powered Analysis & Recommendations**  
- ✅ **Team Collaboration Tools**
- ✅ **Document Management System**
- ✅ **Real-time Analytics Dashboard**
- ✅ **Secure Authentication & Authorization**
- ✅ **Scalable Architecture**
- ✅ **Production-Ready Deployment**

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check GitHub issues
4. Contact the development team

---

**Grant IQ Pro Edition** - Empowering organizations to discover, analyze, and win more grants through intelligent automation and collaboration. 🚀 