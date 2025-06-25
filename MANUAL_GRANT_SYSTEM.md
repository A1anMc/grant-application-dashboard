# Manual Grant Entry System

## 🎯 Overview

The SGE Grant Dashboard now includes a comprehensive manual grant entry system that works alongside the AI scraping functionality. This provides two ways to add grants to your system:

1. **AI Scraping** (when network connectivity allows)
2. **Manual Entry** (always available as backup)

## 🔧 **Solution 1: Manual Grant Entry**

### Command Line Interface

#### Interactive Mode
```bash
node scripts/add_grant_manual.js
```

This launches an interactive menu where you can:
- Add new grants step-by-step
- List all manual grants
- Search existing grants
- View grant details

#### Quick Add Mode
```bash
node scripts/add_grant_manual.js quick "Grant Name" "Funder" "Description" [amount] [deadline]
```

**Example:**
```bash
node scripts/add_grant_manual.js quick "Documentary Production Grant" "Screen Australia" "Funding for documentary film production" "$50,000" "2025-12-31"
```

### Web Dashboard Interface

1. **Access**: Click the "➕ Add Grant Manually" button on the Overview page
2. **Fill Form**: Complete the grant details form
3. **Automatic Processing**: The system automatically:
   - Assesses eligibility based on keywords
   - Generates relevant tags
   - Assigns confidence scores
   - Categorizes the grant

### API Endpoints

- `POST /api/grants/manual` - Add new manual grant
- `PUT /api/grants/manual/:id` - Update existing manual grant  
- `DELETE /api/grants/manual/:id` - Delete manual grant
- `GET /api/grants/search?q=query` - Search all grants

## 🤖 **Solution 2: AI Scraping (Enhanced)**

### Current Status
- **Puppeteer**: ✅ Working (browser launches successfully)
- **Network**: ⚠️ Limited (DNS resolution issues)
- **Fallback**: ✅ Active (provides sample grants when scraping fails)

### Running the Scraper
```bash
node scripts/grant_discovery_scraper.js
```

### Fallback System
When network issues prevent scraping, the system automatically adds relevant fallback grants:
- Screen Australia Documentary Producer Program
- First Nations Stories Fund

### Scheduler (Optional)
```bash
node scripts/grant_discovery_scheduler.js
```

Runs scraping automatically every 24 hours.

## 📊 **Grant Processing Features**

### Automatic Eligibility Assessment
The system analyzes grant text for:
- **Documentary/Film keywords** → 95% confidence
- **First Nations/Indigenous** → 90% confidence  
- **Arts/Culture** → 80% confidence
- **Community/Social Impact** → 75% confidence

### Smart Tagging
Automatically generates tags based on content:
- `FIRST NATIONS` - Indigenous/Aboriginal content
- `DOCUMENTARY` - Film/documentary projects
- `ARTS` - Arts and cultural projects
- `COMMUNITY` - Community-focused initiatives
- `REGIONAL` - Regional/rural projects
- `SOCIAL IMPACT` - Social change projects
- `AUSTRALIAN STORIES` - Australian content

### Eligibility Categories
- **eligible** - Direct match for SGE projects
- **eligible_with_auspice** - Requires partner organization
- **potential** - Possible match, needs review
- **not_eligible** - Poor fit for SGE

## 💾 **Data Storage**

### Files Created
- `mock/manual_grants.json` - Manually entered grants
- `mock/discovered_grants.json` - AI-scraped grants
- `scripts/puppeteer_config.json` - Working browser configuration

### Data Structure
```json
{
  "id": "manual_1750759534828_uex2yfl3p",
  "name": "Grant Name",
  "funder": "Organization Name", 
  "description": "Grant description...",
  "amount_string": "$25,000 - $75,000",
  "due_date": "2025-09-15",
  "tags": ["FIRST NATIONS", "DOCUMENTARY"],
  "eligibility": {
    "category": "eligible",
    "confidence": 0.9,
    "reasoning": "Strong match for First Nations storytelling"
  },
  "source": "manual_entry",
  "created_at": "2025-01-24T...",
  "added_by": "CLI User"
}
```

## 🚀 **Quick Start**

### Add Your First Manual Grant
```bash
# Navigate to project directory
cd "Grant app support"

# Add a grant quickly
node scripts/add_grant_manual.js quick \
  "My Documentary Grant" \
  "Local Arts Council" \
  "Funding for community documentary projects" \
  "$30,000" \
  "2025-08-15"
```

### View in Dashboard
1. Start the backend: `node server.js`
2. Start the frontend: `cd sge-grant-dashboard && npm run dev`
3. Open http://localhost:5173
4. Your manual grants will appear alongside existing grants

## 🔍 **Troubleshooting**

### Puppeteer Issues
- **Browser won't launch**: Try different headless modes
- **Network errors**: Fallback grants will be used automatically
- **Permission errors**: Check macOS security settings

### Manual Entry Issues
- **Missing fields**: Name, funder, and description are required
- **Invalid dates**: Use YYYY-MM-DD format or "Ongoing"
- **API errors**: Check that backend server is running

### Dashboard Issues
- **Grants not showing**: Refresh page or restart backend
- **Modal not opening**: Check browser console for errors
- **Styling issues**: Clear browser cache

## 📈 **Usage Statistics**

The system tracks:
- Total grants (mock + discovered + manual)
- Source breakdown (manual vs scraped vs mock)
- Eligibility distribution
- Upcoming deadlines
- High-value opportunities

## 🔮 **Future Enhancements**

- **Bulk import** from CSV/Excel files
- **Grant templates** for common types
- **Notification system** for deadlines
- **Advanced search** with filters
- **Export functionality** to PDF/Excel
- **Integration** with grant management tools

---

## ✅ **Current Status Summary**

✅ **Manual grant entry system** - Fully functional  
✅ **CLI tools** - Working perfectly  
✅ **Web interface** - Integrated into dashboard  
✅ **API endpoints** - All implemented  
✅ **Automatic processing** - Tags, eligibility, confidence  
⚠️ **AI scraping** - Limited by network, fallback active  
✅ **Data persistence** - All grants saved to JSON files  

**Recommendation**: Use manual entry system as primary method, with AI scraping as supplementary when network allows. 