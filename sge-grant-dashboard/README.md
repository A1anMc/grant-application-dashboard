# Grant IQ Pro Edition - React Frontend

A modern React frontend for Grant IQ Pro Edition, providing an intelligent interface for AI-powered grant discovery and management.

## Features

- **Intelligent Dashboard**: AI-driven insights and real-time analytics
- **Advanced Grant Discovery**: Automated scraping with smart categorization
- **Interactive Analytics**: Dynamic charts and data visualizations
- **Smart Notifications**: Automated deadline monitoring and alerts
- **Manual Grant Management**: Comprehensive CRUD operations
- **Professional UI**: Modern design with responsive layout

## Tech Stack

- **React 18** with Vite for fast development
- **Chart.js** with react-chartjs-2 for analytics
- **Axios** for API communication
- **Modern CSS** with professional design system
- **Component-based architecture** for scalability

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
│   ├── Navbar.jsx              # Navigation with notifications
│   ├── Overview.jsx            # Dashboard with analytics
│   ├── GrantList.jsx           # Grant listing with advanced filters
│   ├── GrantCard.jsx           # Individual grant cards
│   ├── Analytics.jsx           # Interactive charts and insights
│   ├── Insights.jsx            # AI-powered insights
│   ├── NotificationCenter.jsx  # Notification management
│   ├── ManualGrantEntry.jsx    # Manual grant creation
│   └── *.css                  # Component-specific styles
├── utils/
│   └── api.js                 # API utility functions
├── App.jsx                    # Main app component
├── main.jsx                   # Entry point
└── index.css                  # Global design system
```

## API Integration

The frontend connects to the comprehensive backend API:

- **API Base URL**: `/api`
- **Backend Server**: `http://localhost:3000`
- **Key Endpoints**:
  - `GET /api/grants` - Fetch all grants (mock + manual + discovered)
  - `GET /api/grants/manual` - Manual grant management
  - `POST /api/grants/manual` - Create manual grant
  - `GET /api/analytics` - Analytics data
  - `GET /api/notifications` - Notification system
  - `POST /api/scraper/run` - Trigger grant discovery

## Features in Detail

### Intelligent Dashboard
- Real-time grant statistics
- AI-powered insights
- Interactive analytics widgets
- Recent activity feed
- Quick action buttons

### Advanced Grant Discovery
- Automated web scraping
- Smart categorization
- Eligibility assessment
- Multi-source integration
- Comprehensive filtering

### Interactive Analytics
- Grant funding distribution charts
- Eligibility breakdowns
- Discovery timeline visualization
- Confidence score analysis
- Exportable reports

### Smart Notifications
- Automated deadline monitoring
- Email alert system
- Categorized notifications
- Real-time updates
- Notification management

### Manual Grant Management
- Full CRUD operations
- Intelligent form validation
- Automatic eligibility assessment
- Tag generation
- Seamless integration

## Styling

The app uses a professional design system with:
- **Primary Colors**: Blue accent palette with semantic colors
- **Typography**: Inter (headings), Poppins (body text)
- **Design**: Clean, modern interface with subtle animations
- **Responsive**: Mobile-first approach with breakpoints
- **Professional**: Corporate-grade UI components

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in `src/components/`
2. Follow the design system variables in `index.css`
3. Add proper TypeScript types if needed
4. Update API utilities in `src/utils/api.js`
5. Add corresponding CSS with consistent naming

## Deployment

The app is configured for production deployment:

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to:
   - Render.com (configured)
   - Vercel
   - Netlify
   - Any static hosting service

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure the backend is running on port 3000
   - Check the proxy configuration in `vite.config.js`
   - Verify CORS settings for production

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for missing dependencies

3. **Styling Issues**
   - Ensure CSS variables are properly defined
   - Check for conflicting global styles
   - Verify responsive breakpoints

## Contributing

1. Follow the existing component structure
2. Use the design system variables
3. Maintain consistent code formatting
4. Test across different screen sizes
5. Update documentation for new features
