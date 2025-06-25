#!/usr/bin/env node

/**
 * SGE Grant Discovery Integration
 * Complete integration layer for grant discovery system
 */

const GrantDiscoveryScraper = require('./grant_discovery_scraper');
const GrantDiscoveryScheduler = require('./grant_discovery_scheduler');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class GrantDiscoveryIntegration {
    constructor() {
        this.scraper = null;
        this.scheduler = null;
        this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
        this.isInitialized = false;
    }

    async init() {
        console.log('🚀 Initializing SGE Grant Discovery Integration...');
        
        try {
            // Initialize scraper
            this.scraper = new GrantDiscoveryScraper();
            await this.scraper.init();
            
            // Initialize scheduler
            this.scheduler = new GrantDiscoveryScheduler();
            await this.scheduler.init();
            
            this.isInitialized = true;
            console.log('✅ Integration initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize integration:', error);
            throw error;
        }
    }

    async close() {
        if (this.scraper) {
            await this.scraper.close();
        }
        if (this.scheduler) {
            await this.scheduler.close();
        }
    }

    async runFullDiscovery() {
        if (!this.isInitialized) {
            throw new Error('Integration not initialized');
        }

        console.log('🔍 Running full grant discovery process...');
        
        try {
            // Step 1: Run scraper
            console.log('📡 Step 1: Scraping grant sources...');
            const discoveredGrants = await this.scraper.scrapeAllSources();
            
            // Step 2: Save to file
            console.log('💾 Step 2: Saving discovered grants...');
            await this.scraper.saveGrants(discoveredGrants);
            
            // Step 3: Update API
            console.log('🔄 Step 3: Updating API...');
            await this.updateAPIWithGrants(discoveredGrants);
            
            // Step 4: Update statistics
            console.log('📊 Step 4: Updating statistics...');
            await this.updateDiscoveryStats(discoveredGrants);
            
            console.log(`✅ Full discovery completed! Found ${discoveredGrants.length} grants`);
            return discoveredGrants;
            
        } catch (error) {
            console.error('❌ Full discovery failed:', error);
            throw error;
        }
    }

    async updateAPIWithGrants(grants) {
        try {
            const apiUrl = `${this.apiBaseUrl}/api/grants`;
            
            let addedCount = 0;
            let updatedCount = 0;
            let skippedCount = 0;
            
            for (const grant of grants) {
                try {
                    // Try to add new grant
                    await axios.post(apiUrl, grant, {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 10000
                    });
                    addedCount++;
                    
                } catch (error) {
                    if (error.response?.status === 409) {
                        // Grant already exists, try to update
                        try {
                            await axios.put(`${apiUrl}/${grant.id}`, grant, {
                                headers: { 'Content-Type': 'application/json' },
                                timeout: 10000
                            });
                            updatedCount++;
                        } catch (updateError) {
                            console.warn(`Failed to update grant ${grant.name}:`, updateError.message);
                            skippedCount++;
                        }
                    } else {
                        console.warn(`Failed to add grant ${grant.name}:`, error.message);
                        skippedCount++;
                    }
                }
            }
            
            console.log(`📈 API Update Summary:`);
            console.log(`   Added: ${addedCount}`);
            console.log(`   Updated: ${updatedCount}`);
            console.log(`   Skipped: ${skippedCount}`);
            
        } catch (error) {
            console.error('❌ Failed to update API:', error.message);
        }
    }

    async updateDiscoveryStats(grants) {
        try {
            const statsPath = path.join(__dirname, '../mock/discovery_stats.json');
            
            const stats = {
                lastDiscovery: new Date().toISOString(),
                totalGrantsDiscovered: grants.length,
                grantsBySource: grants.reduce((acc, grant) => {
                    const source = grant.source || 'unknown';
                    acc[source] = (acc[source] || 0) + 1;
                    return acc;
                }, {}),
                grantsByEligibility: grants.reduce((acc, grant) => {
                    const category = grant.eligibility?.category || 'unknown';
                    acc[category] = (acc[category] || 0) + 1;
                    return acc;
                }, {}),
                grantsByTag: grants.reduce((acc, grant) => {
                    (grant.tags || []).forEach(tag => {
                        acc[tag] = (acc[tag] || 0) + 1;
                    });
                    return acc;
                }, {})
            };
            
            await fs.writeFile(statsPath, JSON.stringify(stats, null, 2));
            console.log('📊 Discovery statistics updated');
            
        } catch (error) {
            console.error('❌ Failed to update discovery stats:', error);
        }
    }

    async getSystemStatus() {
        try {
            const status = {
                integration: this.isInitialized,
                api: await this.checkAPIHealth(),
                scraper: this.scraper ? 'initialized' : 'not initialized',
                scheduler: this.scheduler ? 'initialized' : 'not initialized',
                discoveryStats: await this.getDiscoveryStats(),
                schedulerStats: this.scheduler ? this.scheduler.getStats() : null
            };
            
            return status;
            
        } catch (error) {
            console.error('❌ Failed to get system status:', error);
            return { error: error.message };
        }
    }

    async checkAPIHealth() {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/api/grants/stats`, {
                timeout: 5000
            });
            return {
                status: 'healthy',
                stats: response.data
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    async getDiscoveryStats() {
        try {
            const statsPath = path.join(__dirname, '../mock/discovery_stats.json');
            const statsData = await fs.readFile(statsPath, 'utf8');
            return JSON.parse(statsData);
        } catch (error) {
            return null;
        }
    }

    async startScheduledDiscovery(schedule = 'daily') {
        if (!this.isInitialized) {
            throw new Error('Integration not initialized');
        }

        console.log(`⏰ Starting scheduled discovery: ${schedule}`);
        
        switch (schedule) {
            case 'daily':
                this.scheduler.startDailyDiscovery();
                break;
            case 'weekly':
                this.scheduler.startWeeklyDiscovery();
                break;
            case 'continuous':
                this.scheduler.startScheduledDiscovery();
                break;
            default:
                throw new Error(`Unknown schedule: ${schedule}`);
        }
        
        // Keep process running
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down integration...');
            await this.close();
            process.exit(0);
        });
    }

    async runManualDiscovery() {
        if (!this.isInitialized) {
            throw new Error('Integration not initialized');
        }

        console.log('🔧 Running manual discovery...');
        return await this.runFullDiscovery();
    }
}

// CLI interface
async function main() {
    const integration = new GrantDiscoveryIntegration();
    
    try {
        await integration.init();
        
        const args = process.argv.slice(2);
        const command = args[0];
        
        switch (command) {
            case 'discover':
                await integration.runManualDiscovery();
                break;
            case 'schedule':
                const schedule = args[1] || 'daily';
                await integration.startScheduledDiscovery(schedule);
                break;
            case 'status':
                const status = await integration.getSystemStatus();
                console.log('📊 System Status:');
                console.log(JSON.stringify(status, null, 2));
                break;
            case 'health':
                const health = await integration.checkAPIHealth();
                console.log('🏥 API Health Check:');
                console.log(JSON.stringify(health, null, 2));
                break;
            default:
                console.log('SGE Grant Discovery Integration');
                console.log('');
                console.log('Usage:');
                console.log('  node grant_discovery_integration.js discover     - Run discovery once');
                console.log('  node grant_discovery_integration.js schedule     - Start daily scheduled discovery');
                console.log('  node grant_discovery_integration.js schedule weekly - Start weekly scheduled discovery');
                console.log('  node grant_discovery_integration.js schedule continuous - Start continuous discovery');
                console.log('  node grant_discovery_integration.js status       - Show system status');
                console.log('  node grant_discovery_integration.js health       - Check API health');
                break;
        }
        
    } catch (error) {
        console.error('❌ Integration failed:', error);
        process.exit(1);
    } finally {
        if (command && ['discover', 'status', 'health'].includes(command)) {
            await integration.close();
        }
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = GrantDiscoveryIntegration; 