#!/bin/bash

echo "🚀 Starting Shadow Goose Grant Portal..."

# Kill any existing server processes
pkill -f "node server.js" 2>/dev/null || true

# Wait a moment
sleep 2

# Navigate to frontend directory
cd "$(dirname "$0")"

# Check if we have a build
if [ ! -d "dist" ]; then
    echo "📦 Building application..."
    npm run build
fi

# Start the server
echo "🌟 Starting server on port 3001..."
echo "📱 Access at: http://localhost:3001?demo=true"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start server with proper error handling
node server.js

echo "Server stopped." 