#!/bin/bash

echo "🚀 Starting SGE Grant Portal (Clean Express Version)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the root directory of the project"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the application
echo "🌟 Starting the application..."
npm run dev

echo "✅ Application started! Open http://localhost:3001 in your browser" 