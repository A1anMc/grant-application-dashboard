# 🚀 How to Start the Shadow Goose Grant Portal

## Quick Start (Recommended)

### Option 1: Use the Startup Script
```bash
cd "Grant app support/frontend"
./start-server.sh
```

### Option 2: Manual Start
```bash
cd "Grant app support/frontend"
npm run build
npm start
```

### Option 3: Direct Node Command
```bash
cd "Grant app support/frontend"
npm run build
node server.js
```

## 🌐 Access Your App

Once the server is running, open your browser and go to:

**Demo Mode (Recommended)**: `http://localhost:3001?demo=true`

**Regular Mode**: `http://localhost:3001`

## 🔧 Troubleshooting

### If you see "Connection Refused":
1. Make sure you're in the `frontend` directory
2. Run `npm run build` first
3. Then run `npm start` or `node server.js`
4. Wait for the "🚀 Shadow Goose Grant Portal running" message

### If port 3001 is busy:
1. Kill existing processes: `pkill -f "node server.js"`
2. Wait 5 seconds
3. Try starting again

### If build fails:
1. Run `npm install` first
2. Then `npm run build`
3. Then `npm start`

## 🎯 What You Should See

When working correctly, you'll see:
```
🚀 Shadow Goose Grant Portal running on port 3001
📱 Access at: http://localhost:3001
🎯 Demo mode: http://localhost:3001?demo=true
🛑 Press Ctrl+C to stop the server
```

## 🏆 Success Indicators

In your browser, you should see:
- ✅ "Shadow Goose Grant Portal" title
- ✅ "System Status" section showing all green checkmarks
- ✅ "Demo mode: ENABLED" 
- ✅ Navigation buttons for Grant Discovery, My Applications, Analytics

## 🚨 Emergency Reset

If nothing works:
```bash
cd "Grant app support/frontend"
pkill -f "node server.js"
rm -rf dist
npm install
npm run build
npm start
```

---

**Your grant portal is ready when you see the welcome dashboard with system status indicators!** 🎉 