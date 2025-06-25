#!/usr/bin/env node

/**
 * SGE Grant Discovery Scheduler
 * Automated scheduling for grant discovery and data updates
 */

const cron = require('node-cron');
const GrantDiscoveryScraper = require('./grant_discovery_scraper');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class GrantDiscoveryScheduler {
    constructor() {
        this.scraper = new GrantDiscoveryScraper();
        this.isRunning = false;
        this.lastRun = null;
        this.stats = {
            totalRuns: 0,
            successfulRuns: 0,
            failedRuns: 0,
            totalGrantsDiscovered: 0,
            lastRunTime: null
        };
    }

    async init() {
        console.log('🚀 Initializing SGE Grant Discovery Scheduler...');
        await this.scraper.initialize();
        await this.loadStats();
    }

    async close() {
        await this.scraper.close();
        await this.saveStats();
    }

    async loadStats() {
        try {
            const statsPath = path.join(__dirname, '../mock/scheduler_stats.json');
            const statsData = await fs.readFile(statsPath, 'utf8');
            this.stats = { ...this.stats, ...JSON.parse(statsData) };
        } catch (error) {
            console.log('No existing stats found, starting fresh');
        }
    }

    async saveStats() {
        try {
            const statsPath = path.join(__dirname, '../mock/scheduler_stats.json');
            await fs.writeFile(statsPath, JSON.stringify(this.stats, null, 2));
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }

    async runDiscovery() {
        if (this.isRunning) {
            console.log('⚠️ Discovery already running, skipping...');
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();
        
        try {
            console.log('🔍 Starting scheduled grant discovery...');
            
            // Run the scraper
            await this.scraper.run();
            
            // Get the discovered grants from the scraper results
            const discoveredGrants = this.scraper.results;
            
            // Update API if running locally
            await this.updateAPI(discoveredGrants);
            
            // Update stats
            this.stats.totalRuns++;
            this.stats.successfulRuns++;
            this.stats.totalGrantsDiscovered += discoveredGrants.length;
            this.stats.lastRunTime = new Date().toISOString();
            this.lastRun = new Date();
            
            const duration = Date.now() - startTime;
            console.log(`✅ Discovery completed successfully in ${duration}ms`);
            console.log(`📊 Discovered ${discoveredGrants.length} new grants`);
            
        } catch (error) {
            console.error('❌ Discovery failed:', error);
            this.stats.totalRuns++;
            this.stats.failedRuns++;
            this.stats.lastRunTime = new Date().toISOString();
        } finally {
            this.isRunning = false;
            await this.saveStats();
        }
    }

    async updateAPI(grants) {
        try {
            // Try to update the local API
            const apiUrl = 'http://localhost:3001/api/grants';
            
            for (const grant of grants) {
                try {
                    await axios.post(apiUrl, grant, {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 5000
                    });
                } catch (error) {
                    if (error.response?.status === 409) {
                        // Grant already exists, skip
                        continue;
                    }
                    console.warn(`Failed to add grant ${grant.name}:`, error.message);
                }
            }
            
            console.log(`🔄 Updated API with ${grants.length} grants`);
        } catch (error) {
            console.log('⚠️ API not available, grants saved to file only');
        }
    }

    startScheduledDiscovery() {
        // Run discovery every 6 hours
        const schedule = '0 */6 * * *';
        
        console.log(`⏰ Scheduling grant discovery: ${schedule}`);
        
        cron.schedule(schedule, async () => {
            console.log('⏰ Scheduled discovery triggered');
            await this.runDiscovery();
        });
        
        // Also run discovery on startup
        console.log('🚀 Running initial discovery...');
        this.runDiscovery();
    }

    startDailyDiscovery() {
        // Run discovery daily at 9 AM
        const schedule = '0 9 * * *';
        
        console.log(`⏰ Scheduling daily grant discovery: ${schedule}`);
        
        cron.schedule(schedule, async () => {
            console.log('⏰ Daily discovery triggered');
            await this.runDiscovery();
        });
        
        // Run initial discovery
        console.log('🚀 Running initial discovery...');
        this.runDiscovery();
    }

    startWeeklyDiscovery() {
        // Run discovery weekly on Monday at 9 AM
        const schedule = '0 9 * * 1';
        
        console.log(`⏰ Scheduling weekly grant discovery: ${schedule}`);
        
        cron.schedule(schedule, async () => {
            console.log('⏰ Weekly discovery triggered');
            await this.runDiscovery();
        });
        
        // Run initial discovery
        console.log('🚀 Running initial discovery...');
        this.runDiscovery();
    }

    async runManualDiscovery() {
        console.log('🔧 Manual discovery triggered');
        await this.runDiscovery();
    }

    getStats() {
        return {
            ...this.stats,
            isRunning: this.isRunning,
            lastRun: this.lastRun,
            uptime: process.uptime()
        };
    }

    async getDiscoveryStatus() {
        try {
            const discoveredPath = path.join(__dirname, '../mock/discovered_grants.json');
            const discoveredData = await fs.readFile(discoveredPath, 'utf8');
            const discoveredGrants = JSON.parse(discoveredData).grants || [];
            
            return {
                discoveredGrants: discoveredGrants.length,
                lastDiscovery: this.lastRun,
                isRunning: this.isRunning,
                stats: this.stats
            };
        } catch (error) {
            return {
                discoveredGrants: 0,
                lastDiscovery: null,
                isRunning: this.isRunning,
                stats: this.stats
            };
        }
    }
}

// CLI interface
async function main() {
    const scheduler = new GrantDiscoveryScheduler();
    const args = process.argv.slice(2);
    const command = args[0];
    
    try {
        await scheduler.init();
        
        switch (command) {
            case 'manual':
                await scheduler.runManualDiscovery();
                break;
            case 'daily':
                scheduler.startDailyDiscovery();
                // Keep process running
                process.on('SIGINT', async () => {
                    console.log('\n🛑 Shutting down scheduler...');
                    await scheduler.close();
                    process.exit(0);
                });
                break;
            case 'weekly':
                scheduler.startWeeklyDiscovery();
                // Keep process running
                process.on('SIGINT', async () => {
                    console.log('\n🛑 Shutting down scheduler...');
                    await scheduler.close();
                    process.exit(0);
                });
                break;
            case 'continuous':
                scheduler.startScheduledDiscovery();
                // Keep process running
                process.on('SIGINT', async () => {
                    console.log('\n🛑 Shutting down scheduler...');
                    await scheduler.close();
                    process.exit(0);
                });
                break;
            case 'stats':
                console.log('📊 Scheduler Statistics:');
                console.log(JSON.stringify(scheduler.getStats(), null, 2));
                break;
            case 'status':
                const status = await scheduler.getDiscoveryStatus();
                console.log('📈 Discovery Status:');
                console.log(JSON.stringify(status, null, 2));
                break;
            default:
                console.log('SGE Grant Discovery Scheduler');
                console.log('');
                console.log('Usage:');
                console.log('  node grant_discovery_scheduler.js manual    - Run discovery once');
                console.log('  node grant_discovery_scheduler.js daily     - Run daily at 9 AM');
                console.log('  node grant_discovery_scheduler.js weekly    - Run weekly on Monday');
                console.log('  node grant_discovery_scheduler.js continuous - Run every 6 hours');
                console.log('  node grant_discovery_scheduler.js stats     - Show statistics');
                console.log('  node grant_discovery_scheduler.js status    - Show discovery status');
                break;
        }
        
    } catch (error) {
        console.error('❌ Scheduler failed:', error);
        process.exit(1);
    } finally {
        if (command && ['manual', 'stats', 'status'].includes(command)) {
            await scheduler.close();
        }
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = GrantDiscoveryScheduler; 