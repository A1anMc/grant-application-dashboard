# SGE Grant Portal

A simple grant discovery and management portal for Shadow Goose Productions.

## Features

- **Pure Express Backend**: Simple, reliable Node.js server
- **Static Frontend**: Vanilla JavaScript, no React complexity
- **Supabase Integration**: Uses real database if credentials provided
- **Mock Data Fallback**: Works without database setup
- **Single Command Startup**: Run from root directory

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or use the startup script
./start-app.sh
```

## Access Points

- **Main App**: http://localhost:3001
- **API Endpoint**: http://localhost:3001/api/grants
- **Health Check**: http://localhost:3001/health

## Project Structure

```
/SGE-GrantPortal
├── server.js          # Express server
├── index.html         # Static frontend
├── api/
│   └── grants.js      # Grants API logic
├── mock/
│   └── mockGrants.json # Mock data
├── package.json       # Dependencies
└── README.md
```

## Environment Variables

To use Supabase (optional):
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

Without these, the app will use mock data automatically.

## Development

```bash
# Start with nodemon (auto-restart on changes)
npm run dev

# Start production server
npm start
``` 