#!/bin/bash

# Grant IQ Pro Edition - Complete Platform Startup Script
# This script starts all services for the full-stack grant management platform

echo "🚀 Starting Grant IQ Pro Edition - Complete Platform"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "⚠️  Python3 not found. PDF processing will be limited."
fi

# Function to cleanup processes on exit
cleanup() {
    echo "🛑 Shutting down Grant IQ Pro Edition..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    if [ ! -z "$PDF_PID" ]; then
        kill $PDF_PID 2>/dev/null
    fi
    echo "✅ All services stopped."
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
fi

if [ ! -d "sge-grant-dashboard/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd sge-grant-dashboard
    npm install
    cd ..
fi

# Start PDF processing service (if Python is available)
if command -v python3 &> /dev/null; then
    echo "🔧 Starting PDF processing service..."
    cd services/pdfProcessor
    python3 main.py &
    PDF_PID=$!
    cd ../..
    echo "✅ PDF service started (PID: $PDF_PID)"
else
    echo "⚠️  PDF service skipped - Python3 not available"
fi

# Start backend server
echo "🔧 Starting backend server..."
PORT=3000 node server.js &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Test backend health
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Start frontend development server
echo "🔧 Starting frontend development server..."
cd sge-grant-dashboard
npm run dev &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
sleep 5

echo ""
echo "🎉 Grant IQ Pro Edition is now running!"
echo "=================================================="
echo "📊 Frontend:     http://localhost:5174"
echo "🔧 Backend API:  http://localhost:3000"
echo "📄 PDF Service:  http://localhost:8000 (if available)"
echo ""
echo "🔐 Demo Login Credentials:"
echo "   Username: alan     Password: admin123 (Admin)"
echo "   Username: ursula   Password: admin123 (Manager)"
echo "   Username: sham     Password: admin123 (Collaborator)"
echo ""
echo "📚 Features Available:"
echo "   ✅ Grant Discovery & Search"
echo "   ✅ AI Eligibility Analysis"
echo "   ✅ Task Planning Engine"
echo "   ✅ Team Collaboration"
echo "   ✅ Document Management"
echo "   ✅ Analytics Dashboard"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================================="

# Keep script running and wait for processes
wait $BACKEND_PID $FRONTEND_PID $PDF_PID 