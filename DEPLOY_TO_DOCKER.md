# 🐳 Deploy with Docker (Full Control Option)

## Why Docker?
- **Complete control** over environment
- **Easy scaling** and management
- **Works anywhere** (AWS, GCP, DigitalOcean, etc.)

## Quick Deploy with Docker Compose

### Step 1: Prepare for Production
```bash
# Create production environment file
cp env.example .env

# Edit .env with your production values
nano .env
```

### Step 2: Build and Deploy
```bash
# Build the application
docker-compose build

# Start in production mode
docker-compose up -d

# View logs
docker-compose logs -f grant-iq-pro
```

### Step 3: Set Up Reverse Proxy (Optional)
```bash
# Start with Nginx reverse proxy
docker-compose --profile production up -d
```

## Deploy to Cloud Providers

### DigitalOcean App Platform
1. Connect GitHub repository
2. Use these settings:
   - **Build Command**: `npm install`
   - **Run Command**: `node server.js`
   - **Environment Variables**: Copy from .env

### AWS ECS/Fargate
1. Push image to ECR
2. Create task definition
3. Deploy as ECS service

### Google Cloud Run
```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/grant-iq-pro

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT_ID/grant-iq-pro --platform managed
```

## Benefits
✅ **Full environment control**  
✅ **Easy local testing**  
✅ **Portable across clouds**  
✅ **Scalable architecture**  
✅ **Production-grade setup**  
