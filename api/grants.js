const express = require('express');
const router = express.Router();
const eligibilityLogic = require('./eligibility');
const fs = require('fs').promises;
const path = require('path');
const ManualGrantManager = require('./manual-grants');

// Initialize manual grant manager
const manualGrantManager = new ManualGrantManager();

// Load mock grants
async function loadMockGrants() {
    try {
        const mockPath = path.join(__dirname, '../mock/mockGrants.json');
        const data = await fs.readFile(mockPath, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.grants || parsed || [];
    } catch (error) {
        console.error('Error loading mock grants:', error);
        return [];
    }
}

// Load discovered grants
async function loadDiscoveredGrants() {
    try {
        const discoveredPath = path.join(__dirname, '../mock/discovered_grants.json');
        const data = await fs.readFile(discoveredPath, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.grants || [];
    } catch (error) {
        console.log('No discovered grants found');
        return [];
    }
}

// Load manual grants
async function loadManualGrants() {
    try {
        const manualData = await manualGrantManager.getAllGrants();
        return manualData.grants || [];
    } catch (error) {
        console.log('No manual grants found');
        return [];
    }
}

// Combine all grant sources
async function getAllGrants() {
    const [mockGrants, discoveredGrants, manualGrants] = await Promise.all([
        loadMockGrants(),
        loadDiscoveredGrants(),
        loadManualGrants()
    ]);

    // Combine all grants
    const allGrants = [
        ...mockGrants,
        ...discoveredGrants,
        ...manualGrants
    ];

    // Filter for future deadlines only
    const now = new Date();
    const futureGrants = allGrants.filter(grant => {
        if (!grant.due_date || grant.due_date === 'Ongoing') return true;
        const deadline = new Date(grant.due_date);
        return deadline > now;
    });

    return futureGrants;
}

// Calculate statistics
function calculateStats(grants) {
    const stats = {
        total: grants.length,
        mock: 0,
        discovered: 0,
        manual: 0,
        eligible: 0,
        deadlineSoon: 0,
        byEligibility: {
            eligible: 0,
            eligible_with_auspice: 0,
            not_eligible: 0,
            potential: 0
        },
        bySource: {},
        upcomingDeadlines: 0
    };

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    grants.forEach(grant => {
        // Count by source type
        if (grant.source === 'manual_entry') {
            stats.manual++;
        } else if (grant.source && grant.source !== 'unknown') {
            stats.discovered++;
        } else {
            stats.mock++;
        }

        // Count by eligibility
        const eligibility = grant.eligibility?.category || 'potential';
        if (stats.byEligibility.hasOwnProperty(eligibility)) {
            stats.byEligibility[eligibility]++;
        }
        
        // Count eligible grants for frontend
        if (eligibility === 'eligible') {
            stats.eligible++;
        }

        // Count by source
        const source = grant.funder || grant.source || 'unknown';
        stats.bySource[source] = (stats.bySource[source] || 0) + 1;

        // Count upcoming deadlines
        if (grant.due_date && grant.due_date !== 'Ongoing') {
            const deadline = new Date(grant.due_date);
            if (deadline > now && deadline <= thirtyDaysFromNow) {
                stats.upcomingDeadlines++;
                stats.deadlineSoon++;
            }
        }
    });

    return stats;
}

// Enhanced grants API with discovery features
class GrantsAPI {
    constructor() {
        this.grants = [];
        this.discoveredGrants = [];
        this.loadGrants();
    }

    async loadGrants() {
        try {
            // Load existing mock grants
            const mockData = await fs.readFile(path.join(__dirname, '../mock/mockGrants.json'), 'utf8');
            this.grants = JSON.parse(mockData).grants || [];

            // Load discovered grants if they exist
            try {
                const discoveredData = await fs.readFile(path.join(__dirname, '../mock/discovered_grants.json'), 'utf8');
                this.discoveredGrants = JSON.parse(discoveredData).grants || [];
            } catch (error) {
                console.log('No discovered grants found, starting fresh');
                this.discoveredGrants = [];
            }

            // Assess eligibility for all grants
            this.grants = this.grants.map(grant => this.assessGrantEligibility(grant));
            this.discoveredGrants = this.discoveredGrants.map(grant => this.assessGrantEligibility(grant));

        } catch (error) {
            console.error('Error loading grants:', error);
            this.grants = [];
            this.discoveredGrants = [];
        }
    }

    assessGrantEligibility(grant) {
        if (!grant.eligibility || grant.eligibility.category === 'potential') {
            const assessment = eligibilityLogic.assessGrantEligibility(grant);
            return {
                ...grant,
                eligibility: assessment
            };
        }
        return grant;
    }

    getAllGrants(filters = {}) {
        let allGrants = [...this.grants, ...this.discoveredGrants];

        // Filter out grants with past deadlines (only show future grants)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day
        allGrants = allGrants.filter(grant => {
            if (!grant.due_date) return false;
            const grantDate = new Date(grant.due_date);
            return grantDate >= today;
        });

        // Apply additional filters
        if (filters.tag) {
            allGrants = allGrants.filter(grant => 
                grant.tags && grant.tags.includes(filters.tag.toUpperCase())
            );
        }

        if (filters.deadline_lt) {
            const deadlineDate = new Date(filters.deadline_lt);
            allGrants = allGrants.filter(grant => {
                if (!grant.due_date) return false;
                const grantDate = new Date(grant.due_date);
                return grantDate <= deadlineDate;
            });
        }

        if (filters.eligible === 'true') {
            allGrants = allGrants.filter(grant => 
                grant.eligibility && grant.eligibility.category === 'eligible'
            );
        }

        if (filters.eligible === 'false') {
            allGrants = allGrants.filter(grant => 
                grant.eligibility && grant.eligibility.category !== 'eligible'
            );
        }

        if (filters.source) {
            allGrants = allGrants.filter(grant => 
                grant.source === filters.source
            );
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            allGrants = allGrants.filter(grant =>
                grant.name.toLowerCase().includes(searchTerm) ||
                grant.funder.toLowerCase().includes(searchTerm) ||
                grant.description.toLowerCase().includes(searchTerm)
            );
        }

        // Sort by due date (earliest first)
        allGrants.sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date) - new Date(b.due_date);
        });

        return allGrants;
    }

    async addGrant(grantData) {
        const newGrant = {
            id: this.generateId(grantData),
            ...grantData,
            created_at: new Date().toISOString(),
            source: grantData.source || 'manual',
            tags: grantData.tags || [],
            eligibility: {
                category: 'potential',
                confidence: 0.5,
                reasoning: 'Manually added grant - requires review'
            }
        };

        // Assess eligibility
        const assessedGrant = this.assessGrantEligibility(newGrant);
        
        // Add to appropriate collection
        if (grantData.source && grantData.source !== 'manual') {
            this.discoveredGrants.push(assessedGrant);
        } else {
            this.grants.push(assessedGrant);
        }

        // Save to file
        await this.saveGrants();

        return assessedGrant;
    }

    async updateGrant(grantId, updates) {
        let grant = this.grants.find(g => g.id === grantId);
        let collection = 'grants';
        
        if (!grant) {
            grant = this.discoveredGrants.find(g => g.id === grantId);
            collection = 'discoveredGrants';
        }

        if (!grant) {
            throw new Error('Grant not found');
        }

        // Update grant
        Object.assign(grant, updates);
        
        // Re-assess eligibility if relevant fields changed
        if (updates.description || updates.tags || updates.funder) {
            grant = this.assessGrantEligibility(grant);
        }

        // Save to file
        await this.saveGrants();

        return grant;
    }

    async deleteGrant(grantId) {
        let index = this.grants.findIndex(g => g.id === grantId);
        let collection = 'grants';
        
        if (index === -1) {
            index = this.discoveredGrants.findIndex(g => g.id === grantId);
            collection = 'discoveredGrants';
        }

        if (index === -1) {
            throw new Error('Grant not found');
        }

        if (collection === 'grants') {
            this.grants.splice(index, 1);
        } else {
            this.discoveredGrants.splice(index, 1);
        }

        await this.saveGrants();
        return { success: true };
    }

    generateId(grantData) {
        const base = `${grantData.name}-${grantData.funder}`.toLowerCase();
        return base.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }

    async saveGrants() {
        try {
            // Save mock grants
            await fs.writeFile(
                path.join(__dirname, '../mock/mockGrants.json'),
                JSON.stringify({ grants: this.grants }, null, 2)
            );

            // Save discovered grants
            await fs.writeFile(
                path.join(__dirname, '../mock/discovered_grants.json'),
                JSON.stringify({ grants: this.discoveredGrants }, null, 2)
            );
        } catch (error) {
            console.error('Error saving grants:', error);
        }
    }

    getStats() {
        const allGrants = [...this.grants, ...this.discoveredGrants];
        
        return {
            total: allGrants.length,
            mock: this.grants.length,
            discovered: this.discoveredGrants.length,
            byEligibility: {
                eligible: allGrants.filter(g => g.eligibility?.category === 'eligible').length,
                eligible_with_auspice: allGrants.filter(g => g.eligibility?.category === 'eligible_with_auspice').length,
                not_eligible: allGrants.filter(g => g.eligibility?.category === 'not_eligible').length,
                potential: allGrants.filter(g => g.eligibility?.category === 'potential').length
            },
            bySource: allGrants.reduce((acc, grant) => {
                const source = grant.source || 'unknown';
                acc[source] = (acc[source] || 0) + 1;
                return acc;
            }, {}),
            upcomingDeadlines: allGrants.filter(grant => {
                if (!grant.due_date) return false;
                const daysUntilDue = Math.ceil((new Date(grant.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                return daysUntilDue >= 0 && daysUntilDue <= 30;
            }).length
        };
    }
}

const grantsAPI = new GrantsAPI();

// Pagination middleware
const paginationDefaults = (req, res, next) => {
  req.pagination = {
    page: parseInt(req.query.page) || 1,
    limit: Math.min(parseInt(req.query.limit) || 20, 100), // Max 100 items
    offset: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 20)
  };
  next();
};

// GET /api/grants - Get all grants with optional filters and pagination
router.get('/', paginationDefaults, async (req, res) => {
    try {
        const allGrants = await getAllGrants();
        const { page, limit, offset } = req.pagination;
        
        // Apply pagination
        const totalItems = allGrants.length;
        const paginatedGrants = allGrants.slice(offset, offset + limit);
        
        const stats = calculateStats(allGrants); // Use all grants for stats
        
        res.json({
            grants: paginatedGrants,
            stats,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                hasNext: page * limit < totalItems,
                hasPrev: page > 1
            },
            filters: []
        });
    } catch (error) {
        console.error('Error getting grants:', error);
        res.status(500).json({ error: 'Failed to get grants' });
    }
});

// GET /api/grants/stats - Get grant statistics
router.get('/stats', (req, res) => {
    try {
        res.json(grantsAPI.getStats());
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// GET /api/grants/:id - Get specific grant
router.get('/:id', (req, res) => {
    try {
        const requestedId = req.params.id;
        // Try to find grant by ID, handling both string and number comparisons
        const grant = grantsAPI.grants.find(g => g.id == requestedId) ||
                     grantsAPI.discoveredGrants.find(g => g.id == requestedId);
        
        if (!grant) {
            return res.status(404).json({ error: 'Grant not found' });
        }
        
        res.json(grant);
    } catch (error) {
        console.error('Error getting grant:', error);
        res.status(500).json({ error: 'Failed to get grant' });
    }
});

// POST /api/grants - Add new grant
router.post('/', async (req, res) => {
    try {
        const requiredFields = ['name', 'funder', 'description'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: 'Missing required fields', 
                missing: missingFields 
            });
        }

        const newGrant = await grantsAPI.addGrant(req.body);
        res.status(201).json(newGrant);
    } catch (error) {
        console.error('Error adding grant:', error);
        res.status(500).json({ error: 'Failed to add grant' });
    }
});

// PUT /api/grants/:id - Update grant
router.put('/:id', async (req, res) => {
    try {
        const updatedGrant = await grantsAPI.updateGrant(req.params.id, req.body);
        res.json(updatedGrant);
    } catch (error) {
        console.error('Error updating grant:', error);
        if (error.message === 'Grant not found') {
            res.status(404).json({ error: 'Grant not found' });
        } else {
            res.status(500).json({ error: 'Failed to update grant' });
        }
    }
});

// DELETE /api/grants/:id - Delete grant
router.delete('/:id', async (req, res) => {
    try {
        await grantsAPI.deleteGrant(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting grant:', error);
        if (error.message === 'Grant not found') {
            res.status(404).json({ error: 'Grant not found' });
        } else {
            res.status(500).json({ error: 'Failed to delete grant' });
        }
    }
});

// POST /api/grants/discover - Trigger grant discovery
router.post('/discover', async (req, res) => {
    try {
        // This would trigger the scraper
        // For now, we'll return a success message
        res.json({ 
            message: 'Grant discovery triggered',
            note: 'Discovery runs asynchronously. Check /api/grants for new grants.'
        });
    } catch (error) {
        console.error('Error triggering discovery:', error);
        res.status(500).json({ error: 'Failed to trigger discovery' });
    }
});

// POST /api/grants/manual - Add manual grant
router.post('/manual', async (req, res) => {
    try {
        const grantData = req.body;
        
        // Validate required fields
        if (!grantData.name || !grantData.funder || !grantData.description) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, funder, description' 
            });
        }

        const newGrant = await manualGrantManager.addGrant(grantData);
        res.status(201).json(newGrant);
    } catch (error) {
        console.error('Error adding manual grant:', error);
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/grants/manual/:id - Update manual grant
router.put('/manual/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const updatedGrant = await manualGrantManager.updateGrant(id, updates);
        res.json(updatedGrant);
    } catch (error) {
        console.error('Error updating manual grant:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
});

// DELETE /api/grants/manual/:id - Delete manual grant
router.delete('/manual/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedGrant = await manualGrantManager.deleteGrant(id);
        res.json({ message: 'Grant deleted successfully', grant: deletedGrant });
    } catch (error) {
        console.error('Error deleting manual grant:', error);
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// GET /api/grants/search?q=query - Search grants
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const grants = await getAllGrants();
        const searchTerm = q.toLowerCase();
        
        const results = grants.filter(grant => 
            grant.name.toLowerCase().includes(searchTerm) ||
            grant.description.toLowerCase().includes(searchTerm) ||
            grant.funder.toLowerCase().includes(searchTerm) ||
            (grant.tags && grant.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );

        res.json({
            query: q,
            results,
            total: results.length
        });
    } catch (error) {
        console.error('Error searching grants:', error);
        res.status(500).json({ error: 'Failed to search grants' });
    }
});

module.exports = router;
