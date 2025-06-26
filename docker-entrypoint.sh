#!/bin/sh

# Start PDF processing service in background
echo "🚀 Starting PDF processing service..."
cd /app/services/pdfProcessor
python3 main.py &
PDF_PID=$!

# Wait a moment for PDF service to start
sleep 2

# Start the main Node.js application
echo "🚀 Starting Grant IQ Pro Edition..."
cd /app
node server.js &
NODE_PID=$!

# Function to handle shutdown
shutdown() {
    echo "📤 Shutting down services..."
    kill $PDF_PID $NODE_PID
    wait $PDF_PID $NODE_PID
    exit 0
}

# Trap SIGTERM and SIGINT
trap shutdown SIGTERM SIGINT

# Wait for processes
wait $NODE_PID 