#!/usr/bin/env node

/**
 * Manual Grant Entry CLI Tool
 * Allows easy addition of grants from command line
 */

const readline = require('readline');
const ManualGrantManager = require('../api/manual-grants');

const manualGrantManager = new ManualGrantManager();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function addGrantInteractively() {
    console.log('\n🎯 SGE Manual Grant Entry Tool');
    console.log('===============================\n');

    try {
        const grantData = {};

        // Required fields
        grantData.name = await question('Grant Name: ');
        if (!grantData.name.trim()) {
            throw new Error('Grant name is required');
        }

        grantData.funder = await question('Funder/Organization: ');
        if (!grantData.funder.trim()) {
            throw new Error('Funder is required');
        }

        grantData.description = await question('Description: ');
        if (!grantData.description.trim()) {
            throw new Error('Description is required');
        }

        // Optional fields
        grantData.amount = await question('Amount (or press Enter for "Contact for details"): ');
        if (!grantData.amount.trim()) {
            grantData.amount = 'Contact for details';
        }

        grantData.deadline = await question('Deadline (YYYY-MM-DD or "Ongoing"): ');
        if (!grantData.deadline.trim()) {
            grantData.deadline = 'Ongoing';
        }

        grantData.source_url = await question('Source URL (optional): ');

        const statusOptions = ['potential', 'drafting', 'submitted', 'under_review'];
        console.log(`\nStatus options: ${statusOptions.join(', ')}`);
        grantData.status = await question('Status (or press Enter for "potential"): ');
        if (!grantData.status.trim()) {
            grantData.status = 'potential';
        }

        grantData.added_by = await question('Added by (your name): ');
        if (!grantData.added_by.trim()) {
            grantData.added_by = 'CLI User';
        }

        // Confirm before adding
        console.log('\n📋 Grant Summary:');
        console.log('=================');
        console.log(`Name: ${grantData.name}`);
        console.log(`Funder: ${grantData.funder}`);
        console.log(`Description: ${grantData.description}`);
        console.log(`Amount: ${grantData.amount}`);
        console.log(`Deadline: ${grantData.deadline}`);
        console.log(`Status: ${grantData.status}`);
        console.log(`Source URL: ${grantData.source_url || 'None'}`);
        console.log(`Added by: ${grantData.added_by}`);

        const confirm = await question('\nAdd this grant? (y/N): ');
        
        if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
            const newGrant = await manualGrantManager.addGrant(grantData);
            
            console.log('\n✅ Grant added successfully!');
            console.log(`📊 Grant ID: ${newGrant.id}`);
            console.log(`🏷️  Tags: ${newGrant.tags.join(', ')}`);
            console.log(`🎯 Eligibility: ${newGrant.eligibility.category} (${Math.round(newGrant.eligibility.confidence * 100)}% confidence)`);
            console.log(`💡 Reasoning: ${newGrant.eligibility.reasoning}`);
        } else {
            console.log('\n❌ Grant not added.');
        }

    } catch (error) {
        console.error('\n❌ Error adding grant:', error.message);
    }
}

async function listGrants() {
    try {
        const data = await manualGrantManager.getAllGrants();
        const grants = data.grants || [];

        console.log('\n📋 Manual Grants List');
        console.log('=====================\n');

        if (grants.length === 0) {
            console.log('No manual grants found.');
            return;
        }

        grants.forEach((grant, index) => {
            console.log(`${index + 1}. ${grant.name}`);
            console.log(`   Funder: ${grant.funder}`);
            console.log(`   Amount: ${grant.amount_string}`);
            console.log(`   Deadline: ${grant.due_date}`);
            console.log(`   Status: ${grant.status}`);
            console.log(`   Eligibility: ${grant.eligibility.category}`);
            console.log(`   Added: ${new Date(grant.created_at).toLocaleDateString()}`);
            console.log(`   ID: ${grant.id}`);
            console.log('');
        });

        console.log(`Total: ${grants.length} manual grants`);
        
    } catch (error) {
        console.error('\n❌ Error listing grants:', error.message);
    }
}

async function searchGrants() {
    try {
        const query = await question('Search query: ');
        if (!query.trim()) {
            console.log('❌ Search query required');
            return;
        }

        const results = await manualGrantManager.searchGrants(query);

        console.log(`\n🔍 Search Results for "${query}"`);
        console.log('================================\n');

        if (results.length === 0) {
            console.log('No grants found matching your search.');
            return;
        }

        results.forEach((grant, index) => {
            console.log(`${index + 1}. ${grant.name}`);
            console.log(`   Funder: ${grant.funder}`);
            console.log(`   Tags: ${grant.tags.join(', ')}`);
            console.log(`   ID: ${grant.id}`);
            console.log('');
        });

        console.log(`Found: ${results.length} grants`);
        
    } catch (error) {
        console.error('\n❌ Error searching grants:', error.message);
    }
}

async function quickAdd() {
    // Quick add from command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
        console.log('Usage: node add_grant_manual.js quick "Grant Name" "Funder" "Description" [amount] [deadline]');
        return;
    }

    try {
        const grantData = {
            name: args[1],
            funder: args[2],
            description: args[3],
            amount: args[4] || 'Contact for details',
            deadline: args[5] || 'Ongoing',
            status: 'potential',
            added_by: 'CLI Quick Add'
        };

        const newGrant = await manualGrantManager.addGrant(grantData);
        
        console.log('✅ Grant added successfully!');
        console.log(`📊 Grant ID: ${newGrant.id}`);
        console.log(`🏷️  Tags: ${newGrant.tags.join(', ')}`);
        console.log(`🎯 Eligibility: ${newGrant.eligibility.category}`);
        
    } catch (error) {
        console.error('❌ Error adding grant:', error.message);
    }
}

async function main() {
    const command = process.argv[2];

    if (command === 'quick') {
        await quickAdd();
        process.exit(0);
    }

    console.log('\n🎯 SGE Manual Grant Management');
    console.log('==============================');
    console.log('1. Add new grant');
    console.log('2. List all manual grants');
    console.log('3. Search grants');
    console.log('4. Exit');

    while (true) {
        try {
            const choice = await question('\nSelect option (1-4): ');

            switch (choice) {
                case '1':
                    await addGrantInteractively();
                    break;
                case '2':
                    await listGrants();
                    break;
                case '3':
                    await searchGrants();
                    break;
                case '4':
                    console.log('\n👋 Goodbye!');
                    process.exit(0);
                default:
                    console.log('❌ Invalid option. Please choose 1-4.');
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n\n👋 Goodbye!');
    rl.close();
    process.exit(0);
});

if (require.main === module) {
    main().finally(() => {
        rl.close();
    });
} 