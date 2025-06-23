# Grant Management Application

This is a web application for managing grant applications and opportunities. The project uses modern web technologies to provide a seamless experience for organizations seeking and managing grants.

## Tech Stack

### Frontend
- React (Vite)
- TypeScript
- TailwindCSS for styling
- Supabase JS Client for backend communication

### Backend
The backend is managed by Supabase, providing:
- PostgreSQL Database
- Authentication
- Real-time subscriptions
- Row Level Security
- API Auto-generation

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Create a `.env.local` file in the frontend directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Features
- Grant opportunity management
- Organization profile management
- AI-powered eligibility analysis
- Grant source web scraping (via separate Python script) 