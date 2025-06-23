#!/usr/bin/env python3
"""
Demo Australian Grant Discovery
Generates realistic grant data for Shadow Goose Entertainment without actual web scraping
"""

import json
import csv
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import List
import random

@dataclass
class Grant:
    title: str
    source: str
    amount: str
    due_date: str
    summary: str
    eligibility: str
    tags: List[str]
    url: str
    pdf_url: str = ""
    score: int = 0
    notes: str = ""
    grant_type: str = ""
    open_date: str = ""
    recurrence: str = ""
    urgency: str = ""
    estimated_eligibility: str = ""

class DemoGrantDiscovery:
    def __init__(self):
        # Shadow Goose Entertainment profile for relevance scoring
        self.org_profile = {
            "type": "media company",
            "focus_areas": ["documentary", "digital storytelling", "social impact", "first nations", 
                          "youth empowerment", "environmental resilience", "creative innovation"],
            "eligibility_types": ["independent companies", "creative collectives", "social enterprises"]
        }
        
        # Sample grant data based on real Australian funding bodies
        self.sample_grants = self.generate_realistic_grants()
    
    def generate_realistic_grants(self) -> List[Grant]:
        """Generate realistic Australian grant data"""
        grants = []
        
        # Creative Australia (Australia Council) Grants
        grants.extend([
            Grant(
                title="Arts Projects - Individual Artists",
                source="Creative Australia",
                amount="$5,000 - $60,000",
                due_date="15 March 2025",
                summary="Support for individual artists to create new work, develop their practice, or collaborate with others. Funding for film, digital media, and cross-artform projects.",
                eligibility="Individual artists who are Australian citizens or permanent residents. Must demonstrate artistic merit and professional development outcomes.",
                tags=["Arts", "Film", "Digital Media", "Individual"],
                url="https://australiacouncil.gov.au/funding/funding-index/arts-projects-individual-artists/",
                pdf_url="https://australiacouncil.gov.au/workspace/uploads/files/arts-projects-guidelines.pdf",
                grant_type="Project Funding",
                open_date="15 January 2025",
                recurrence="Annual",
                urgency="Normal",
                score=85,
                estimated_eligibility="High - matches documentary and digital storytelling focus"
            ),
            
            Grant(
                title="First Nations Arts and Culture Program",
                source="Creative Australia",
                amount="$10,000 - $150,000",
                due_date="28 February 2025",
                summary="Support for First Nations artists and cultural practitioners to create, present and distribute their work. Priority for projects that strengthen cultural protocols and community engagement.",
                eligibility="First Nations artists, cultural practitioners, and organisations. Must demonstrate connection to community and cultural protocols.",
                tags=["First Nations", "Arts", "Culture", "Community"],
                url="https://australiacouncil.gov.au/funding/funding-index/first-nations-arts-and-culture/",
                pdf_url="https://australiacouncil.gov.au/workspace/uploads/files/first-nations-guidelines.pdf",
                grant_type="Cultural Development",
                open_date="1 December 2024",
                recurrence="Annual",
                urgency="Hot",
                score=95,
                estimated_eligibility="Very High - directly aligns with First Nations storytelling focus"
            )
        ])
        
        # Screen Australia Grants
        grants.extend([
            Grant(
                title="Documentary Producer Program",
                source="Screen Australia",
                amount="$20,000 - $500,000",
                due_date="30 April 2025",
                summary="Development and production funding for documentary projects that reflect Australian stories and perspectives. Priority for projects addressing social issues, environment, and diverse communities.",
                eligibility="Independent production companies with demonstrated track record. Must have Australian content and creative control.",
                tags=["Documentary", "Film", "Social Impact", "Australian Stories"],
                url="https://www.screenaustralia.gov.au/funding-and-support/feature-films/documentary/",
                pdf_url="https://www.screenaustralia.gov.au/getmedia/documentary-guidelines.pdf",
                grant_type="Production Funding",
                open_date="1 February 2025",
                recurrence="Ongoing",
                urgency="Normal",
                score=92,
                estimated_eligibility="Very High - perfect match for documentary production"
            ),
            
            Grant(
                title="Online and Games Fund",
                source="Screen Australia",
                amount="$30,000 - $200,000",
                due_date="20 March 2025",
                summary="Support for innovative digital content including web series, interactive documentaries, and immersive storytelling experiences. Focus on emerging technologies and new platforms.",
                eligibility="Australian production companies, digital agencies, and creative collectives. Must demonstrate innovation in digital storytelling.",
                tags=["Digital Media", "Innovation", "Interactive", "Web Series"],
                url="https://www.screenaustralia.gov.au/funding-and-support/online-and-games/",
                pdf_url="https://www.screenaustralia.gov.au/getmedia/online-games-guidelines.pdf",
                grant_type="Digital Innovation",
                open_date="15 January 2025",
                recurrence="Quarterly",
                urgency="Normal",
                score=88,
                estimated_eligibility="High - matches digital storytelling and innovation focus"
            )
        ])
        
        # Victorian Government Grants
        grants.extend([
            Grant(
                title="Creative Partnerships Australia",
                source="Creative Victoria",
                amount="$25,000 - $100,000",
                due_date="10 February 2025",
                summary="Funding for partnerships between creative organisations and community groups to deliver projects that address social challenges through arts and creativity.",
                eligibility="Victorian-based creative organisations partnering with community groups. Must demonstrate social impact outcomes.",
                tags=["Partnership", "Social Impact", "Community", "Victoria"],
                url="https://creative.vic.gov.au/grants-and-support/grants/creative-partnerships-australia",
                pdf_url="https://creative.vic.gov.au/grants/creative-partnerships-guidelines.pdf",
                grant_type="Partnership Funding",
                open_date="1 November 2024",
                recurrence="Annual",
                urgency="Hot",
                score=78,
                estimated_eligibility="Medium - requires Victorian base but matches social impact focus"
            ),
            
            Grant(
                title="VicScreen Development Programs",
                source="VicScreen",
                amount="$15,000 - $75,000",
                due_date="31 March 2025",
                summary="Development funding for screen content including documentaries, digital series, and innovative storytelling formats. Priority for diverse voices and stories.",
                eligibility="Victorian screen practitioners and production companies. Must demonstrate Victorian economic benefit.",
                tags=["Screen", "Development", "Diverse Voices", "Victoria"],
                url="https://vicscreen.vic.gov.au/funding/development-programs/",
                pdf_url="https://vicscreen.vic.gov.au/funding/development-guidelines.pdf",
                grant_type="Development Funding",
                open_date="1 January 2025",
                recurrence="Annual",
                urgency="Normal",
                score=82,
                estimated_eligibility="Medium-High - good match but requires Victorian presence"
            )
        ])
        
        # Federal Government Grants
        grants.extend([
            Grant(
                title="Community Grants Programme",
                source="Department of Social Services",
                amount="$5,000 - $50,000",
                due_date="25 February 2025",
                summary="Funding for community organisations to deliver projects that strengthen communities and support vulnerable groups. Includes digital inclusion and storytelling initiatives.",
                eligibility="Incorporated not-for-profit organisations, community groups, and social enterprises. Must demonstrate community benefit.",
                tags=["Community", "Social Enterprise", "Digital Inclusion", "Vulnerable Groups"],
                url="https://www.dss.gov.au/grants/community-grants-programme",
                pdf_url="https://www.dss.gov.au/grants/community-grants-guidelines.pdf",
                grant_type="Community Support",
                open_date="15 December 2024",
                recurrence="Annual",
                urgency="Hot",
                score=65,
                estimated_eligibility="Medium - requires NFP structure but good community focus match"
            ),
            
            Grant(
                title="Innovative Communities Programme",
                source="Department of Industry, Science and Resources",
                amount="$50,000 - $300,000",
                due_date="15 April 2025",
                summary="Support for innovative projects that use technology and creative approaches to address community challenges. Includes digital storytelling and media innovation projects.",
                eligibility="Australian businesses, research organisations, and community groups. Must demonstrate innovation and scalability.",
                tags=["Innovation", "Technology", "Community Challenges", "Scalability"],
                url="https://business.gov.au/grants-and-programs/innovative-communities-programme",
                pdf_url="https://business.gov.au/grants/innovative-communities-guidelines.pdf",
                grant_type="Innovation Funding",
                open_date="1 February 2025",
                recurrence="Annual",
                urgency="Normal",
                score=75,
                estimated_eligibility="Medium-High - good innovation match, need to demonstrate scalability"
            )
        ])
        
        # Foundation and Philanthropic Grants
        grants.extend([
            Grant(
                title="Westpac Foundation Social Impact Grants",
                source="Westpac Foundation",
                amount="$10,000 - $100,000",
                due_date="1 March 2025",
                summary="Funding for projects that create positive social impact in Australian communities. Priority for projects addressing education, social inclusion, and community resilience.",
                eligibility="Australian registered charities and social enterprises. Must demonstrate measurable social impact outcomes.",
                tags=["Social Impact", "Foundation", "Community Resilience", "Social Enterprise"],
                url="https://www.westpac.com.au/about-westpac/westpac-group/community/grants/",
                pdf_url="https://www.westpac.com.au/content/dam/public/wbc/documents/pdf/aw/community/social-impact-grants-guidelines.pdf",
                grant_type="Philanthropic",
                open_date="1 January 2025",
                recurrence="Annual",
                urgency="Normal",
                score=70,
                estimated_eligibility="Medium - requires charity/social enterprise status"
            ),
            
            Grant(
                title="Foundation for Rural & Regional Renewal",
                source="FRRR",
                amount="$5,000 - $35,000",
                due_date="20 March 2025",
                summary="Small grants for rural and regional communities to deliver projects that strengthen community connections and address local challenges through creative and innovative approaches.",
                eligibility="Rural and regional community groups, schools, and small organisations. Must be located outside major metropolitan areas.",
                tags=["Rural", "Regional", "Community", "Small Grants"],
                url="https://frrr.org.au/funding/",
                pdf_url="https://frrr.org.au/cb_pages/files/FRRR-Guidelines.pdf",
                grant_type="Community Development",
                open_date="1 February 2025",
                recurrence="Quarterly",
                urgency="Normal",
                score=55,
                estimated_eligibility="Low-Medium - requires rural/regional location"
            )
        ])
        
        # Youth and Education Grants
        grants.extend([
            Grant(
                title="Youth Arts Development Program",
                source="Australia Council for the Arts",
                amount="$8,000 - $40,000",
                due_date="5 March 2025",
                summary="Support for projects that engage young people (15-25) in arts and creative activities. Priority for projects that develop skills, provide mentorship, and create pathways to creative careers.",
                eligibility="Arts organisations, youth organisations, and educational institutions working with young people aged 15-25.",
                tags=["Youth", "Arts Development", "Mentorship", "Creative Careers"],
                url="https://australiacouncil.gov.au/funding/funding-index/youth-arts-development/",
                pdf_url="https://australiacouncil.gov.au/workspace/uploads/files/youth-arts-guidelines.pdf",
                grant_type="Youth Development",
                open_date="15 January 2025",
                recurrence="Annual",
                urgency="Hot",
                score=85,
                estimated_eligibility="High - directly matches youth empowerment focus"
            ),
            
            Grant(
                title="Digital Learning Innovation Fund",
                source="Department of Education",
                amount="$25,000 - $150,000",
                due_date="10 April 2025",
                summary="Funding for innovative digital learning projects that use creative media and storytelling to enhance educational outcomes. Priority for projects addressing disadvantaged communities.",
                eligibility="Educational institutions, ed-tech companies, and creative organisations with educational partnerships.",
                tags=["Education", "Digital Learning", "Innovation", "Disadvantaged Communities"],
                url="https://education.gov.au/grants/digital-learning-innovation-fund",
                pdf_url="https://education.gov.au/grants/digital-learning-guidelines.pdf",
                grant_type="Educational Innovation",
                open_date="1 February 2025",
                recurrence="Annual",
                urgency="Normal",
                score=72,
                estimated_eligibility="Medium-High - good match with educational partnership requirement"
            )
        ])
        
        # Environmental Grants
        grants.extend([
            Grant(
                title="Environment and Heritage Grants",
                source="Department of Climate Change, Energy, Environment and Water",
                amount="$15,000 - $200,000",
                due_date="28 March 2025",
                summary="Funding for projects that protect and restore Australian environments through community engagement, education, and innovative communication approaches including digital storytelling.",
                eligibility="Environmental organisations, community groups, and creative organisations with environmental focus. Must demonstrate environmental outcomes.",
                tags=["Environment", "Heritage", "Community Engagement", "Digital Storytelling"],
                url="https://www.dcceew.gov.au/environment/grants",
                pdf_url="https://www.dcceew.gov.au/environment/grants/guidelines.pdf",
                grant_type="Environmental",
                open_date="1 January 2025",
                recurrence="Annual",
                urgency="Normal",
                score=80,
                estimated_eligibility="High - matches environmental resilience and storytelling focus"
            )
        ])
        
        return grants
    
    def calculate_urgency(self, due_date: str) -> str:
        """Calculate urgency based on due date"""
        try:
            # Parse due date (simplified for demo)
            if "February" in due_date or "March" in due_date:
                return "Hot" if "February" in due_date else "Normal"
            return "Normal"
        except:
            return "Normal"
    
    def export_to_csv(self, grants: List[Grant], filename: str = "australian_grants_demo.csv"):
        """Export grants to CSV"""
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['title', 'source', 'amount', 'due_date', 'summary', 
                         'eligibility', 'tags', 'url', 'pdf_url', 'score', 'notes',
                         'grant_type', 'urgency', 'estimated_eligibility', 'open_date', 'recurrence']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for grant in grants:
                row = asdict(grant)
                row['tags'] = ', '.join(row['tags'])  # Convert list to string
                writer.writerow(row)
        
        print(f"✅ Exported {len(grants)} grants to {filename}")
    
    def export_to_json(self, grants: List[Grant], filename: str = "australian_grants_demo.json"):
        """Export grants to JSON"""
        grants_data = [asdict(grant) for grant in grants]
        
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(grants_data, jsonfile, indent=2, ensure_ascii=False)
        
        print(f"✅ Exported {len(grants)} grants to {filename}")
    
    def generate_discovery_report(self, grants: List[Grant]):
        """Generate a comprehensive discovery report"""
        # Calculate statistics
        total_grants = len(grants)
        high_relevance = [g for g in grants if g.score >= 80]
        urgent_grants = [g for g in grants if g.urgency == "Hot"]
        
        # Group by source
        sources = {}
        for grant in grants:
            sources[grant.source] = sources.get(grant.source, 0) + 1
        
        # Group by tags
        tag_counts = {}
        for grant in grants:
            for tag in grant.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Generate report
        print("\n" + "="*80)
        print("🇦🇺 AUSTRALIAN GRANT DISCOVERY REPORT - SHADOW GOOSE ENTERTAINMENT")
        print("="*80)
        print(f"📅 Discovery Date: {datetime.now().strftime('%d %B %Y')}")
        print(f"📊 Total Grants Found: {total_grants}")
        print(f"⭐ High Relevance Grants (80+ score): {len(high_relevance)}")
        print(f"🔥 Urgent Grants (closing soon): {len(urgent_grants)}")
        
        print(f"\n📈 GRANTS BY SOURCE:")
        for source, count in sorted(sources.items(), key=lambda x: x[1], reverse=True):
            print(f"   • {source}: {count} grants")
        
        print(f"\n🏷️ TOP GRANT CATEGORIES:")
        for tag, count in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:8]:
            print(f"   • {tag}: {count} grants")
        
        print(f"\n🏆 TOP 10 MOST RELEVANT GRANTS FOR SHADOW GOOSE ENTERTAINMENT:")
        print("-" * 80)
        
        sorted_grants = sorted(grants, key=lambda x: x.score, reverse=True)[:10]
        for i, grant in enumerate(sorted_grants, 1):
            print(f"{i:2}. {grant.title}")
            print(f"    💰 Amount: {grant.amount}")
            print(f"    📅 Due Date: {grant.due_date} | ⚡ Urgency: {grant.urgency}")
            print(f"    🏢 Source: {grant.source}")
            print(f"    ⭐ Relevance Score: {grant.score}/100")
            print(f"    🎯 Estimated Eligibility: {grant.estimated_eligibility}")
            print(f"    🏷️ Tags: {', '.join(grant.tags[:4])}")
            print(f"    🔗 URL: {grant.url}")
            print("-" * 80)
        
        print(f"\n🔥 URGENT GRANTS (CLOSING SOON):")
        if urgent_grants:
            for grant in urgent_grants:
                print(f"   • {grant.title} - Due: {grant.due_date} ({grant.source})")
        else:
            print("   No urgent grants found")
        
        print(f"\n💡 RECOMMENDATIONS FOR SHADOW GOOSE ENTERTAINMENT:")
        recommendations = [
            "Focus on First Nations Arts and Culture Program (Score: 95) - Perfect match for your storytelling focus",
            "Apply for Documentary Producer Program (Score: 92) - Directly supports your documentary work",
            "Consider Youth Arts Development Program (Score: 85) - Aligns with youth empowerment mission",
            "Explore Creative Partnerships for social impact projects",
            "Look into state-specific grants if you establish presence in Victoria or NSW"
        ]
        
        for i, rec in enumerate(recommendations, 1):
            print(f"   {i}. {rec}")
        
        print("\n" + "="*80)
        
        return {
            'total_grants': total_grants,
            'high_relevance_count': len(high_relevance),
            'urgent_count': len(urgent_grants),
            'sources': sources,
            'top_tags': dict(sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
            'top_grants': [asdict(g) for g in sorted_grants]
        }

def main():
    """Main execution function"""
    print("🚀 Starting Australian Grant Discovery Demo...")
    print("   Generating realistic grant data for Shadow Goose Entertainment")
    
    discovery = DemoGrantDiscovery()
    grants = discovery.sample_grants
    
    # Generate and display report
    report = discovery.generate_discovery_report(grants)
    
    # Export data
    print(f"\n📁 EXPORTING DATA:")
    discovery.export_to_csv(grants)
    discovery.export_to_json(grants)
    
    print(f"\n✨ Discovery Complete! Found {len(grants)} relevant Australian grants.")
    print(f"📄 Data exported to CSV and JSON files for further analysis.")
    
    return grants

if __name__ == "__main__":
    grants = main() 