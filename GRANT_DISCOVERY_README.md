# 🚀 SGE Grant Discovery Engine

A comprehensive grant discovery system that automatically scans multiple Australian grant sources and integrates with the SGE Grant Portal.

## 🎯 Overview

The SGE Grant Discovery Engine transforms your grant portal into a true grant discovery platform by:

- **Automatically scraping** multiple Australian grant sources
- **Filtering for SGE relevance** using intelligent keyword matching
- **Integrating seamlessly** with your existing API and dashboard
- **Providing scheduling** for automated discovery
- **Offering comprehensive** statistics and monitoring

## 📡 Supported Grant Sources

| Source | Type | URL | Focus |
|--------|------|-----|-------|
| GrantConnect | Government | grants.gov.au | Federal grants |
| Australian Cultural Fund | Cultural | australianculturalfund.org.au | Arts & culture |
| Philanthropy Australia | Philanthropy | philanthropy.org.au | Philanthropic grants |
| SmartyGrants | Platform | smartygrants.com.au | Grant platform |
| Victorian Government | Government | vic.gov.au/grants | State grants |
| Foundation for Rural & Regional Renewal | Regional | frrr.org.au | Regional development |

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
npm install puppeteer cheerio axios node-cron
```

### 2. Update package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "discover": "node scripts/grant_discovery_scraper.js",
    "discover:manual": "node scripts/grant_discovery_scheduler.js manual",
    "discover:daily": "node scripts/grant_discovery_scheduler.js daily",
    "discover:weekly": "node scripts/grant_discovery_scheduler.js weekly",
    "discover:continuous": "node scripts/grant_discovery_scheduler.js continuous",
    "discover:stats": "node scripts/grant_discovery_scheduler.js stats",
    "discover:status": "node scripts/grant_discovery_scheduler.js status"
  }
}
```

### 3. Environment Variables

Create a `.env` file (optional):

```env
API_BASE_URL=http://localhost:3001
DISCOVERY_SCHEDULE=daily
LOG_LEVEL=info
```

## 🚀 Usage

### Manual Discovery

Run a one-time grant discovery:

```bash
npm run discover:manual
```

### Scheduled Discovery

Start automated discovery:

```bash
# Daily at 9 AM
npm run discover:daily

# Weekly on Monday at 9 AM
npm run discover:weekly

# Every 6 hours
npm run discover:continuous
```

### Check Status

```bash
# View discovery statistics
npm run discover:stats

# Check system status
npm run discover:status
```

## 🔍 How It Works

### 1. Source Scraping

The system uses **Puppeteer** to scrape grant listings from multiple sources:

```javascript
// Example scraping logic
const grants = await page.$$('.grant-item');
for (const element of grants) {
    const grant = await element.evaluate(el => ({
        name: el.querySelector('.grant-title')?.textContent?.trim(),
        funder: el.querySelector('.funder')?.textContent?.trim(),
        amount: el.querySelector('.amount')?.textContent?.trim(),
        deadline: el.querySelector('.deadline')?.textContent?.trim(),
        description: el.querySelector('.description')?.textContent?.trim(),
        link: el.querySelector('a')?.href
    }));
}
```

### 2. SGE Filtering

Grants are filtered using SGE-specific keywords:

```javascript
const sgeKeywords = [
    'documentary', 'film', 'screen', 'media', 'production',
    'first nations', 'indigenous', 'aboriginal', 'torres strait',
    'arts', 'culture', 'community', 'social impact',
    'storytelling', 'narrative', 'creative', 'digital media',
    'regional', 'rural', 'youth', 'education', 'heritage'
];
```

### 3. Data Enrichment

Discovered grants are enriched with:

- **Automatic tagging** based on content analysis
- **Eligibility assessment** using existing logic
- **Status determination** based on deadlines
- **Amount parsing** from various formats

### 4. API Integration

Grants are automatically added to your existing API:

```javascript
// POST to your API endpoint
await axios.post('http://localhost:3001/api/grants', grant);
```

## 📊 Enhanced API Features

Your existing `/api/grants` endpoint now supports:

### Filtering

```bash
# Filter by tag
GET /api/grants?tag=DOCUMENTARY

# Filter by deadline
GET /api/grants?deadline_lt=2024-12-31

# Filter by eligibility
GET /api/grants?eligible=true

# Filter by source
GET /api/grants?source=GrantConnect

# Search across fields
GET /api/grants?search=indigenous
```

### Statistics

```bash
GET /api/grants/stats
```

Returns:
```json
{
  "total": 25,
  "mock": 8,
  "discovered": 17,
  "byEligibility": {
    "eligible": 12,
    "eligible_with_auspice": 5,
    "not_eligible": 3,
    "potential": 5
  },
  "bySource": {
    "GrantConnect": 8,
    "Australian Cultural Fund": 4,
    "manual": 8
  },
  "upcomingDeadlines": 3
}
```

### Manual Grant Management

```bash
# Add new grant
POST /api/grants
{
  "name": "New Grant",
  "funder": "Test Funder",
  "description": "Test description",
  "amount_string": "$10,000 - $50,000",
  "due_date": "2024-12-31",
  "tags": ["ARTS", "COMMUNITY"]
}

# Update grant
PUT /api/grants/grant-id
{
  "description": "Updated description"
}

# Delete grant
DELETE /api/grants/grant-id
```

## 📈 Monitoring & Analytics

### Discovery Statistics

The system tracks comprehensive statistics:

- **Total runs** and success/failure rates
- **Grants discovered** per source
- **Processing times** and performance metrics
- **Error rates** and failure reasons

### Dashboard Integration

Your existing dashboard now shows:

- **Discovery status** and last run time
- **Source breakdown** of grants
- **Eligibility distribution** including discovered grants
- **Upcoming deadlines** from all sources

## 🔧 Configuration

### Customizing Sources

Edit `scripts/grant_discovery_scraper.js` to add new sources:

```javascript
this.sources = {
    newSource: {
        name: 'New Grant Source',
        url: 'https://example.com/grants',
        type: 'custom'
    }
};
```

### Customizing Keywords

Update SGE keywords in the scraper:

```javascript
this.sgeKeywords = [
    // Add your custom keywords
    'your-keyword', 'another-keyword'
];
```

### Scheduling Options

Modify schedules in `scripts/grant_discovery_scheduler.js`:

```javascript
// Custom schedule (every 4 hours)
const schedule = '0 */4 * * *';

// Custom time (2 PM daily)
const schedule = '0 14 * * *';
```

## 🚀 Deployment

### Local Development

```bash
# Start your API server
npm run dev

# Run discovery in another terminal
npm run discover:daily
```

### Production Deployment

For production, consider:

1. **Docker containerization** for the discovery service
2. **Cron jobs** on your server
3. **Cloud functions** (AWS Lambda, Google Cloud Functions)
4. **GitHub Actions** for scheduled runs

### Example Docker Setup

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN chmod +x scripts/*.js

CMD ["npm", "run", "discover:daily"]
```

## 🔍 Troubleshooting

### Common Issues

1. **Puppeteer fails to launch**
   ```bash
   # Install additional dependencies
   apt-get update && apt-get install -y \
       gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
       libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
       libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
       libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
       libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
       libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation \
       libappindicator1 libnss3 lsb-release xdg-utils wget
   ```

2. **API connection fails**
   - Check if your API server is running
   - Verify the API_BASE_URL environment variable
   - Check firewall settings

3. **No grants discovered**
   - Verify source URLs are accessible
   - Check if source website structure has changed
   - Review SGE keywords for relevance

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run discover:manual
```

## 📚 API Reference

### Discovery Endpoints

```bash
# Trigger manual discovery
POST /api/grants/discover

# Get discovery status
GET /api/grants/discovery/status

# Get discovery statistics
GET /api/grants/discovery/stats
```

### Enhanced Grant Endpoints

```bash
# Get all grants with filters
GET /api/grants?tag=DOCUMENTARY&eligible=true

# Get specific grant
GET /api/grants/:id

# Add new grant
POST /api/grants

# Update grant
PUT /api/grants/:id

# Delete grant
DELETE /api/grants/:id
```

## 🎉 Success Metrics

With the grant discovery engine, you can expect:

- **10-50x more grants** in your system
- **Real-time updates** from multiple sources
- **Automated relevance filtering** for SGE
- **Comprehensive analytics** and reporting
- **Reduced manual effort** in grant research

## 🤝 Contributing

To add new grant sources or improve the system:

1. Fork the repository
2. Add your source to `scripts/grant_discovery_scraper.js`
3. Test with `npm run discover:manual`
4. Submit a pull request

## 📄 License

This grant discovery system is part of the SGE Grant Portal project.

---

**Ready to transform your grant portal into a comprehensive discovery engine?** 🚀

Start with `npm run discover:manual` to see the system in action! 