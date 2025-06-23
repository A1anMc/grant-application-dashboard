# SGE Grant Portal - React Frontend

A modern React frontend for the Shadow Goose Grant Portal, providing an intuitive interface for grant discovery and management.

## Features

- **Dashboard Overview**: Key metrics and recent grants
- **Grant Database**: Comprehensive grant listing with filtering and search
- **Grant Details**: Detailed view of individual grants with eligibility assessment
- **Analytics**: Charts and insights for grant data analysis
- **Settings**: Configuration for the grant discovery system

## Tech Stack

- **React 18** with Vite for fast development
- **React Router 6** for navigation
- **Chart.js** with react-chartjs-2 for analytics
- **Axios** for API communication
- **Modern CSS** with responsive design

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Backend**
   Make sure your Express backend is running on port 3000:
   ```bash
   # From the parent directory
   npm start
   ```

3. **Start the React App**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation component
│   ├── Overview.jsx        # Dashboard overview
│   ├── GrantList.jsx       # Grant listing with filters
│   ├── GrantDetails.jsx    # Individual grant details
│   ├── Analytics.jsx       # Charts and analytics
│   ├── Settings.jsx        # Configuration settings
│   └── *.css              # Component-specific styles
├── App.jsx                 # Main app component with routing
├── main.jsx               # Entry point
└── index.css              # Global styles
```

## API Integration

The frontend connects to your existing Express backend through a proxy configuration:

- **API Base URL**: `/api`
- **Backend Server**: `http://localhost:3000`
- **Key Endpoints**:
  - `GET /api/grants` - Fetch all grants
  - `GET /api/grants/:id` - Fetch specific grant
  - `GET /api/grants?tag=...&eligibility=...` - Filtered grants
  - `POST /api/scraper/run` - Manual scrape trigger
  - `GET /api/scheduler/status` - Scheduler status

## Features in Detail

### Dashboard Overview
- Total grants count
- Active grants
- Upcoming deadlines
- Total grant value
- Recent grants list

### Grant Database
- Advanced filtering by tags and eligibility
- Search functionality
- Pagination
- Eligibility badges
- Responsive table design

### Grant Details
- Comprehensive grant information
- Eligibility assessment details
- Contact information
- Quick action buttons
- Tag display

### Analytics
- Grant amounts over time chart
- Eligibility distribution
- Top grant tags
- Quick statistics
- Configurable time ranges

### Settings
- Grant discovery configuration
- Display preferences
- System status monitoring
- Manual scrape controls
- Scheduler management

## Styling

The app uses a modern design system with:
- **Primary Colors**: #0B2545 (Navy), #D95D39 (Orange), #F4A261 (Light Orange)
- **Typography**: Montserrat (headings), Roboto (body)
- **Design**: Clean, professional interface with subtle animations
- **Responsive**: Mobile-first design approach

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Adding New Features

1. Create new components in `src/components/`
2. Add routes in `App.jsx`
3. Update navigation in `Navbar.jsx`
4. Add corresponding CSS files

## Deployment

The app can be deployed to any static hosting service:

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to:
   - Vercel
   - Netlify
   - GitHub Pages
   - Any static hosting service

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure the backend is running on port 3000
   - Check the proxy configuration in `vite.config.js`

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

3. **Styling Issues**
   - Ensure all CSS files are properly imported
   - Check for conflicting global styles

## Contributing

1. Follow the existing code structure
2. Use consistent naming conventions
3. Add appropriate CSS for new components
4. Test on different screen sizes
5. Update documentation as needed
