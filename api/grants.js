const express = require('express');
const router = express.Router();
const eligibilityLogic = require('./eligibility');
const fs = require('fs').promises;
const path = require('path');

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

// GET /api/grants - Get all grants with optional filters
router.get('/', (req, res) => {
    try {
        const filters = {
            tag: req.query.tag,
            deadline_lt: req.query.deadline_lt,
            eligible: req.query.eligible,
            source: req.query.source,
            search: req.query.search
        };

        const grants = grantsAPI.getAllGrants(filters);
        
        res.json({
            grants,
            stats: grantsAPI.getStats(),
            filters: Object.keys(filters).filter(key => filters[key])
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

module.exports = router;
