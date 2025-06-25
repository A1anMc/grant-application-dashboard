/**
 * Manual Grant Entry API
 * Allows manual addition of grants when scraping is not available
 */

const fs = require('fs').promises;
const path = require('path');

class ManualGrantManager {
    constructor() {
        this.manualGrantsFile = path.join(__dirname, '../mock/manual_grants.json');
    }

    async loadManualGrants() {
        try {
            const data = await fs.readFile(this.manualGrantsFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // File doesn't exist, return empty structure
            return {
                grants: [],
                lastUpdated: new Date().toISOString(),
                total: 0
            };
        }
    }

    async saveManualGrants(grantsData) {
        await fs.writeFile(this.manualGrantsFile, JSON.stringify(grantsData, null, 2));
    }

    generateId() {
        return `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    validateGrant(grant) {
        const required = ['name', 'funder', 'description'];
        const missing = required.filter(field => !grant[field] || grant[field].trim() === '');
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        // Validate deadline format if provided
        if (grant.deadline && grant.deadline !== 'Ongoing') {
            const date = new Date(grant.deadline);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid deadline format. Use YYYY-MM-DD or "Ongoing"');
            }
        }

        return true;
    }

    assessEligibility(grant) {
        const text = `${grant.name} ${grant.description}`.toLowerCase();
        let confidence = 0.5;
        let reasoning = 'Manual entry - requires review';
        
        // Check for strong matches
        if (text.includes('documentary') && text.includes('film')) {
            confidence = 0.95;
            reasoning = 'Excellent match for documentary film production';
        } else if (text.includes('first nations') || text.includes('indigenous')) {
            confidence = 0.9;
            reasoning = 'Strong match for First Nations/Indigenous content';
        } else if (text.includes('arts') && text.includes('culture')) {
            confidence = 0.8;
            reasoning = 'Good match for arts and cultural projects';
        } else if (text.includes('community') && text.includes('social')) {
            confidence = 0.75;
            reasoning = 'Good community and social impact focus';
        }
        
        let category = 'potential';
        if (confidence >= 0.9) category = 'eligible';
        else if (confidence >= 0.7) category = 'eligible_with_auspice';
        else if (confidence >= 0.5) category = 'potential';
        else category = 'not_eligible';
        
        return {
            category,
            confidence,
            reasoning
        };
    }

    extractTags(grant) {
        const text = `${grant.name} ${grant.description}`.toLowerCase();
        const tags = [];
        
        if (text.includes('first nations') || text.includes('indigenous') || text.includes('aboriginal')) {
            tags.push('FIRST NATIONS');
        }
        if (text.includes('documentary') || text.includes('film')) {
            tags.push('DOCUMENTARY');
        }
        if (text.includes('arts') || text.includes('culture')) {
            tags.push('ARTS');
        }
        if (text.includes('community')) {
            tags.push('COMMUNITY');
        }
        if (text.includes('regional') || text.includes('rural')) {
            tags.push('REGIONAL');
        }
        if (text.includes('social impact')) {
            tags.push('SOCIAL IMPACT');
        }
        if (text.includes('australian')) {
            tags.push('AUSTRALIAN STORIES');
        }
        
        return tags.length > 0 ? tags : ['GENERAL'];
    }

    async addGrant(grantData) {
        // Validate input
        this.validateGrant(grantData);

        // Load existing grants
        const data = await this.loadManualGrants();

        // Process the grant
        const processedGrant = {
            id: this.generateId(),
            name: grantData.name.trim(),
            funder: grantData.funder.trim(),
            description: grantData.description.trim(),
            amount_string: grantData.amount || 'Contact for details',
            due_date: grantData.deadline || 'Ongoing',
            status: grantData.status || 'potential',
            source_url: grantData.source_url || '',
            created_at: new Date().toISOString(),
            tags: this.extractTags(grantData),
            eligibility: this.assessEligibility(grantData),
            source: 'manual_entry',
            added_by: grantData.added_by || 'system'
        };

        // Add to grants array
        data.grants.push(processedGrant);
        data.total = data.grants.length;
        data.lastUpdated = new Date().toISOString();

        // Save back to file
        await this.saveManualGrants(data);

        return processedGrant;
    }

    async updateGrant(id, updates) {
        const data = await this.loadManualGrants();
        const grantIndex = data.grants.findIndex(g => g.id === id);
        
        if (grantIndex === -1) {
            throw new Error(`Grant with ID ${id} not found`);
        }

        // Validate updates if they contain required fields
        if (updates.name || updates.funder || updates.description) {
            const updatedGrant = { ...data.grants[grantIndex], ...updates };
            this.validateGrant(updatedGrant);
        }

        // Apply updates
        data.grants[grantIndex] = {
            ...data.grants[grantIndex],
            ...updates,
            updated_at: new Date().toISOString()
        };

        // Recalculate eligibility and tags if content changed
        if (updates.name || updates.description) {
            data.grants[grantIndex].tags = this.extractTags(data.grants[grantIndex]);
            data.grants[grantIndex].eligibility = this.assessEligibility(data.grants[grantIndex]);
        }

        data.lastUpdated = new Date().toISOString();
        await this.saveManualGrants(data);

        return data.grants[grantIndex];
    }

    async deleteGrant(id) {
        const data = await this.loadManualGrants();
        const grantIndex = data.grants.findIndex(g => g.id === id);
        
        if (grantIndex === -1) {
            throw new Error(`Grant with ID ${id} not found`);
        }

        const deletedGrant = data.grants.splice(grantIndex, 1)[0];
        data.total = data.grants.length;
        data.lastUpdated = new Date().toISOString();

        await this.saveManualGrants(data);
        return deletedGrant;
    }

    async getAllGrants() {
        return await this.loadManualGrants();
    }

    async getGrantById(id) {
        const data = await this.loadManualGrants();
        return data.grants.find(g => g.id === id);
    }

    async searchGrants(query) {
        const data = await this.loadManualGrants();
        const searchTerm = query.toLowerCase();
        
        return data.grants.filter(grant => 
            grant.name.toLowerCase().includes(searchTerm) ||
            grant.description.toLowerCase().includes(searchTerm) ||
            grant.funder.toLowerCase().includes(searchTerm) ||
            grant.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
}

module.exports = ManualGrantManager; 