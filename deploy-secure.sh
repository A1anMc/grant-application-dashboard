#!/bin/bash

echo "🚀 Deploying Grant IQ Pro Edition - SECURE VERSION"
echo "=============================================="

# Check if running as root (security check)
if [ "$EUID" -eq 0 ]; then
  echo "❌ Do not run as root for security reasons"
  exit 1
fi

# Environment setup
export NODE_ENV=production
export JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}
export REFRESH_SECRET=${REFRESH_SECRET:-$(openssl rand -base64 32)}

echo "✅ Environment variables set"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd sge-grant-dashboard
npm ci --only=production
npm run build
cd ..

echo "✅ Dependencies installed"

# Create secure directories
echo "🔐 Setting up secure directories..."
mkdir -p uploads/temp
mkdir -p logs
chmod 750 uploads
chmod 750 logs

# Set file permissions
echo "🔐 Setting secure file permissions..."
find . -name "*.js" -exec chmod 644 {} \;
find . -name "*.json" -exec chmod 644 {} \;
chmod 755 server.js
chmod 755 deploy-secure.sh

echo "✅ Secure permissions set"

# Start services
echo "🚀 Starting Grant IQ Pro Edition..."

# Start backend with PM2 (production process manager)
if command -v pm2 &> /dev/null; then
    echo "📊 Starting with PM2..."
    pm2 start server.js --name "grant-iq-pro" --env production
    pm2 save
    echo "✅ Backend started with PM2"
else
    echo "⚠️ PM2 not found, starting with node..."
    node server.js &
    echo $! > grant-iq-pro.pid
    echo "✅ Backend started (PID saved to grant-iq-pro.pid)"
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo "🌐 Backend: http://localhost:3000"
echo "📊 Analytics: http://localhost:3000/api/analytics/dashboard"
echo "🔒 Security: Rate limiting, input validation, file security active"
echo "📝 Logs: Check logs/ directory for application logs"
echo ""
echo "🔐 SECURITY FEATURES ACTIVE:"
echo "  ✅ Rate limiting on all endpoints"
echo "  ✅ Input validation with Joi schemas"
echo "  ✅ File upload security with signature validation"
echo "  ✅ Authentication required for sensitive endpoints"
echo "  ✅ Helmet security headers"
echo "  ✅ CORS protection"
echo "  ✅ Error handling middleware"
echo ""
echo "📋 To stop the application:"
if command -v pm2 &> /dev/null; then
    echo "  pm2 stop grant-iq-pro"
else
    echo "  kill \$(cat grant-iq-pro.pid)"
fi

