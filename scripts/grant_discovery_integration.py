#!/usr/bin/env python3
"""
Grant Discovery Integration
Connects the web scraper to the Supabase database and updates the grant discovery dashboard
"""

import asyncio
import json
import os
from datetime import datetime
from typing import List, Dict
from supabase import create_client, Client
from grant_discovery_scraper import GrantDiscoveryScraper, Grant
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GrantDiscoveryIntegration:
    def __init__(self):
        # Initialize Supabase client
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_KEY')  # Use service key for server-side operations
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
    async def discover_and_update_grants(self):
        """Main function to discover grants and update database"""
        logger.info("Starting grant discovery and database update...")
        
        # Run the scraper
        async with GrantDiscoveryScraper() as scraper:
            discovered_grants = await scraper.scrape_all_sources()
        
        logger.info(f"Discovered {len(discovered_grants)} grants")
        
        # Update database
        await self.update_grants_database(discovered_grants)
        
        # Generate summary report
        await self.generate_discovery_report(discovered_grants)
        
        return discovered_grants
    
    async def update_grants_database(self, grants: List[Grant]):
        """Update the grants table with discovered grants"""
        logger.info("Updating grants database...")
        
        new_grants = 0
        updated_grants = 0
        
        for grant in grants:
            try:
                # Check if grant already exists (by title and source)
                existing = self.supabase.table('grants').select('id').eq('name', grant.title).eq('funder', grant.source).execute()
                
                grant_data = {
                    'name': grant.title,
                    'funder': grant.source,
                    'description': grant.summary,
                    'amount_string': grant.amount,
                    'due_date': self.parse_date(grant.due_date),
                    'status': 'potential',
                    'source_url': grant.url,
                    'updated_at': datetime.utcnow().isoformat()
                }
                
                if existing.data:
                    # Update existing grant
                    self.supabase.table('grants').update(grant_data).eq('id', existing.data[0]['id']).execute()
                    updated_grants += 1
                else:
                    # Insert new grant
                    grant_data['created_at'] = datetime.utcnow().isoformat()
                    self.supabase.table('grants').insert(grant_data).execute()
                    new_grants += 1
                    
                # Store additional metadata in a separate table
                await self.store_grant_metadata(grant, existing.data[0]['id'] if existing.data else None)
                
            except Exception as e:
                logger.error(f"Error updating grant {grant.title}: {str(e)}")
                continue
        
        logger.info(f"Database update complete: {new_grants} new grants, {updated_grants} updated grants")
    
    async def store_grant_metadata(self, grant: Grant, grant_id: int = None):
        """Store additional grant metadata like tags, scores, etc."""
        try:
            # Get the grant ID if not provided
            if not grant_id:
                result = self.supabase.table('grants').select('id').eq('name', grant.title).eq('funder', grant.source).execute()
                if result.data:
                    grant_id = result.data[0]['id']
                else:
                    return
            
            metadata = {
                'grant_id': grant_id,
                'tags': grant.tags,
                'relevance_score': grant.score,
                'urgency': grant.urgency,
                'grant_type': grant.grant_type,
                'eligibility_text': grant.eligibility,
                'pdf_url': grant.pdf_url,
                'estimated_eligibility': grant.estimated_eligibility,
                'recurrence': grant.recurrence,
                'discovery_date': datetime.utcnow().isoformat(),
                'notes': grant.notes
            }
            
            # Check if metadata already exists
            existing_meta = self.supabase.table('grant_metadata').select('id').eq('grant_id', grant_id).execute()
            
            if existing_meta.data:
                # Update existing metadata
                self.supabase.table('grant_metadata').update(metadata).eq('grant_id', grant_id).execute()
            else:
                # Insert new metadata
                self.supabase.table('grant_metadata').insert(metadata).execute()
                
        except Exception as e:
            logger.error(f"Error storing metadata for grant {grant.title}: {str(e)}")
    
    def parse_date(self, date_string: str) -> str:
        """Parse date string to ISO format"""
        if "not specified" in date_string.lower():
            return None
        
        # This would need more robust date parsing
        # For now, return the original string
        return date_string
    
    async def generate_discovery_report(self, grants: List[Grant]):
        """Generate a discovery report for dashboard display"""
        logger.info("Generating discovery report...")
        
        # Calculate statistics
        total_grants = len(grants)
        high_relevance = len([g for g in grants if g.score >= 70])
        urgent_grants = len([g for g in grants if g.urgency == "Hot"])
        
        # Group by source
        sources = {}
        for grant in grants:
            sources[grant.source] = sources.get(grant.source, 0) + 1
        
        # Group by tags
        tag_counts = {}
        for grant in grants:
            for tag in grant.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        report = {
            'discovery_date': datetime.utcnow().isoformat(),
            'total_grants': total_grants,
            'high_relevance_grants': high_relevance,
            'urgent_grants': urgent_grants,
            'sources': sources,
            'top_tags': dict(sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
            'top_grants': [
                {
                    'title': g.title,
                    'source': g.source,
                    'score': g.score,
                    'amount': g.amount,
                    'due_date': g.due_date,
                    'tags': g.tags
                }
                for g in sorted(grants, key=lambda x: x.score, reverse=True)[:20]
            ]
        }
        
        # Store report in database
        try:
            self.supabase.table('discovery_reports').insert(report).execute()
            logger.info("Discovery report stored in database")
        except Exception as e:
            logger.error(f"Error storing discovery report: {str(e)}")
        
        # Also save to file for backup
        with open(f'discovery_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    async def setup_database_tables(self):
        """Setup additional database tables for grant metadata"""
        logger.info("Setting up database tables...")
        
        # This would typically be done via SQL migration
        # For demo purposes, we'll log what tables we need
        
        tables_needed = [
            "grant_metadata - stores tags, scores, and additional grant data",
            "discovery_reports - stores periodic discovery run summaries",
            "grant_tracking - tracks user interactions with discovered grants"
        ]
        
        for table in tables_needed:
            logger.info(f"Table needed: {table}")

async def run_discovery_pipeline():
    """Run the complete grant discovery pipeline"""
    try:
        integration = GrantDiscoveryIntegration()
        
        # Setup database if needed
        await integration.setup_database_tables()
        
        # Run discovery and update
        grants = await integration.discover_and_update_grants()
        
        print(f"\n🎉 Grant Discovery Complete!")
        print(f"📊 Total grants discovered: {len(grants)}")
        print(f"⭐ High relevance grants (70+ score): {len([g for g in grants if g.score >= 70])}")
        print(f"🔥 Urgent grants: {len([g for g in grants if g.urgency == 'Hot'])}")
        
        # Show top 5 grants
        print(f"\n🏆 TOP 5 GRANTS FOR SHADOW GOOSE ENTERTAINMENT:")
        for i, grant in enumerate(sorted(grants, key=lambda x: x.score, reverse=True)[:5], 1):
            print(f"{i}. {grant.title}")
            print(f"   💰 {grant.amount} | 📅 {grant.due_date} | ⭐ Score: {grant.score}")
            print(f"   🏢 {grant.source}")
            print(f"   🏷️ {', '.join(grant.tags[:3])}")
            print()
        
        return grants
        
    except Exception as e:
        logger.error(f"Error in discovery pipeline: {str(e)}")
        raise

if __name__ == "__main__":
    # Set environment variables (in production, these would be set in the environment)
    # os.environ['SUPABASE_URL'] = 'your-supabase-url'
    # os.environ['SUPABASE_SERVICE_KEY'] = 'your-service-key'
    
    asyncio.run(run_discovery_pipeline()) 