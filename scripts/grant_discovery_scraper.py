#!/usr/bin/env python3
"""
Australian Grant Discovery Scraper
Automatically discovers and extracts grant opportunities from Australian government and funding websites
"""

import asyncio
import aiohttp
import json
import csv
import re
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Set
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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

class GrantDiscoveryScraper:
    def __init__(self):
        self.session = None
        self.discovered_grants = []
        self.priority_domains = [
            "https://www.grants.gov.au",
            "https://business.gov.au/grants-and-programs",
            "https://www.creative.gov.au/funding-opportunities/",
            "https://www.screen.org.au/funding-support/",
            "https://www.fundingcentre.com.au",
            "https://www.philanthropy.org.au/grants/",
            "https://vic.gov.au/grants",
            "https://nsw.gov.au/grants-and-funding",
            "https://qld.gov.au/about/how-government-works/grants-awards-and-honours",
            "https://sa.gov.au/topics/business-and-trade/grants-and-funding",
            "https://wa.gov.au/government/grants-subsidies-and-funding",
            "https://nt.gov.au/industry/grants-and-funding",
            "https://australiacouncil.gov.au",
            "https://communitygrants.gov.au",
            "https://film.vic.gov.au/funding/"
        ]
        
        # Keywords for different categories
        self.keywords = {
            "media": ["media", "broadcasting", "digital content", "podcast", "radio", "television"],
            "film": ["film", "cinema", "documentary", "video production", "screen", "animation"],
            "arts": ["arts", "culture", "creative", "artistic", "cultural heritage", "performing arts"],
            "innovation": ["innovation", "technology", "digital", "startup", "entrepreneurship", "R&D"],
            "youth": ["youth", "young people", "children", "students", "education", "schools"],
            "first_nations": ["indigenous", "aboriginal", "torres strait", "first nations", "native title"],
            "environment": ["environment", "sustainability", "climate", "conservation", "renewable"],
            "social_impact": ["social impact", "community", "social enterprise", "not-for-profit", "charity"]
        }
        
        # Shadow Goose Entertainment profile for relevance scoring
        self.org_profile = {
            "type": "media company",
            "focus_areas": ["documentary", "digital storytelling", "social impact", "first nations", 
                          "youth empowerment", "environmental resilience", "creative innovation"],
            "eligibility_types": ["independent companies", "creative collectives", "social enterprises"]
        }

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def fetch_page(self, url: str) -> Optional[str]:
        """Fetch a webpage with error handling"""
        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    logger.warning(f"HTTP {response.status} for {url}")
                    return None
        except Exception as e:
            logger.error(f"Error fetching {url}: {str(e)}")
            return None

    def extract_grants_from_grants_gov_au(self, html: str, base_url: str) -> List[Grant]:
        """Extract grants from grants.gov.au"""
        grants = []
        soup = BeautifulSoup(html, 'html.parser')
        
        # Look for grant listings (this would need to be customized based on actual site structure)
        grant_items = soup.find_all(['div', 'article'], class_=re.compile(r'grant|funding|opportunity', re.I))
        
        for item in grant_items:
            try:
                title_elem = item.find(['h1', 'h2', 'h3', 'h4'], class_=re.compile(r'title|heading|name', re.I))
                title = title_elem.get_text(strip=True) if title_elem else "Unknown Grant"
                
                # Extract other details
                amount = self.extract_amount(item.get_text())
                due_date = self.extract_date(item.get_text())
                summary = self.extract_summary(item.get_text())
                url = self.extract_url(item, base_url)
                
                grant = Grant(
                    title=title,
                    source="grants.gov.au",
                    amount=amount,
                    due_date=due_date,
                    summary=summary,
                    eligibility=self.extract_eligibility(item.get_text()),
                    tags=self.generate_tags(title + " " + summary),
                    url=url
                )
                
                grant.score = self.calculate_relevance_score(grant)
                grant.urgency = self.calculate_urgency(due_date)
                grants.append(grant)
                
            except Exception as e:
                logger.error(f"Error extracting grant from item: {str(e)}")
                continue
        
        return grants

    def extract_grants_from_creative_gov_au(self, html: str, base_url: str) -> List[Grant]:
        """Extract grants from creative.gov.au"""
        grants = []
        soup = BeautifulSoup(html, 'html.parser')
        
        # Creative Australia specific selectors
        funding_items = soup.find_all(['div', 'section'], class_=re.compile(r'funding|grant|program', re.I))
        
        for item in funding_items:
            try:
                title_elem = item.find(['h1', 'h2', 'h3'], class_=re.compile(r'title|heading', re.I))
                if not title_elem:
                    continue
                    
                title = title_elem.get_text(strip=True)
                
                grant = Grant(
                    title=title,
                    source="Creative Australia",
                    amount=self.extract_amount(item.get_text()),
                    due_date=self.extract_date(item.get_text()),
                    summary=self.extract_summary(item.get_text()),
                    eligibility=self.extract_eligibility(item.get_text()),
                    tags=self.generate_tags(title + " " + item.get_text()),
                    url=self.extract_url(item, base_url),
                    grant_type="Arts & Culture"
                )
                
                grant.score = self.calculate_relevance_score(grant)
                grant.urgency = self.calculate_urgency(grant.due_date)
                grants.append(grant)
                
            except Exception as e:
                logger.error(f"Error extracting Creative Australia grant: {str(e)}")
                continue
        
        return grants

    def extract_amount(self, text: str) -> str:
        """Extract funding amount from text"""
        # Look for currency patterns
        amount_patterns = [
            r'\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|mil|k|thousand))?',
            r'(?:up to|maximum of|max)\s*\$[\d,]+',
            r'[\d,]+\s*(?:dollars|AUD)',
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0).strip()
        
        return "Amount not specified"

    def extract_date(self, text: str) -> str:
        """Extract due date from text"""
        # Look for date patterns
        date_patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{4}',
            r'\d{4}[/-]\d{1,2}[/-]\d{1,2}',
            r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}',
            r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}',
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0).strip()
        
        return "Date not specified"

    def extract_summary(self, text: str, max_length: int = 200) -> str:
        """Extract a summary from text"""
        # Clean text
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Look for description-like content
        sentences = re.split(r'[.!?]+', text)
        summary = ""
        
        for sentence in sentences:
            if len(summary + sentence) <= max_length:
                summary += sentence.strip() + ". "
            else:
                break
        
        return summary.strip() or text[:max_length] + "..."

    def extract_eligibility(self, text: str) -> str:
        """Extract eligibility information"""
        eligibility_keywords = [
            "eligible", "eligibility", "criteria", "requirements", 
            "must be", "applicants", "who can apply"
        ]
        
        sentences = re.split(r'[.!?]+', text)
        eligibility_sentences = []
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in eligibility_keywords):
                eligibility_sentences.append(sentence.strip())
        
        return ". ".join(eligibility_sentences[:3]) if eligibility_sentences else "Eligibility criteria not specified"

    def extract_url(self, element, base_url: str) -> str:
        """Extract URL from element"""
        link = element.find('a', href=True)
        if link:
            href = link['href']
            if href.startswith('http'):
                return href
            else:
                return urljoin(base_url, href)
        return base_url

    def generate_tags(self, text: str) -> List[str]:
        """Generate tags based on content"""
        tags = set()
        text_lower = text.lower()
        
        for category, keywords in self.keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                tags.add(category.replace('_', ' ').title())
        
        # Additional specific tags
        if any(word in text_lower for word in ['documentary', 'film', 'video']):
            tags.add('Documentary')
        if any(word in text_lower for word in ['startup', 'entrepreneur', 'business']):
            tags.add('Business')
        if any(word in text_lower for word in ['research', 'development', 'pilot']):
            tags.add('Research')
        
        return list(tags)

    def calculate_relevance_score(self, grant: Grant) -> int:
        """Calculate relevance score (0-100) based on Shadow Goose Entertainment profile"""
        score = 0
        text = (grant.title + " " + grant.summary + " " + grant.eligibility).lower()
        
        # Score based on focus areas
        focus_area_weights = {
            "documentary": 25,
            "digital storytelling": 25,
            "social impact": 20,
            "first nations": 20,
            "youth": 15,
            "environmental": 15,
            "creative innovation": 15,
            "media": 20,
            "arts": 15
        }
        
        for area, weight in focus_area_weights.items():
            if area.replace(" ", "") in text.replace(" ", ""):
                score += weight
        
        # Bonus for eligibility match
        eligibility_terms = ["independent", "creative collective", "social enterprise", "nfp", "not-for-profit"]
        if any(term in text for term in eligibility_terms):
            score += 15
        
        # Cap at 100
        return min(score, 100)

    def calculate_urgency(self, due_date: str) -> str:
        """Calculate urgency based on due date"""
        if "not specified" in due_date.lower():
            return "Unknown"
        
        try:
            # Try to parse date (this would need more robust date parsing)
            # For now, return based on keywords
            if any(word in due_date.lower() for word in ['urgent', 'soon', 'asap']):
                return "Hot"
            elif any(word in due_date.lower() for word in ['this month', 'next week']):
                return "Hot"
            else:
                return "Normal"
        except:
            return "Unknown"

    async def scrape_all_sources(self) -> List[Grant]:
        """Scrape all priority domains"""
        all_grants = []
        
        for domain in self.priority_domains:
            logger.info(f"Scraping {domain}...")
            
            try:
                html = await self.fetch_page(domain)
                if not html:
                    continue
                
                # Route to appropriate extractor based on domain
                if "grants.gov.au" in domain:
                    grants = self.extract_grants_from_grants_gov_au(html, domain)
                elif "creative.gov.au" in domain:
                    grants = self.extract_grants_from_creative_gov_au(html, domain)
                else:
                    # Generic extractor for other sites
                    grants = self.extract_grants_generic(html, domain)
                
                all_grants.extend(grants)
                logger.info(f"Found {len(grants)} grants from {domain}")
                
                # Rate limiting
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Error scraping {domain}: {str(e)}")
                continue
        
        # Remove duplicates and sort by relevance score
        unique_grants = self.deduplicate_grants(all_grants)
        sorted_grants = sorted(unique_grants, key=lambda x: x.score, reverse=True)
        
        return sorted_grants

    def extract_grants_generic(self, html: str, base_url: str) -> List[Grant]:
        """Generic grant extractor for unknown sites"""
        grants = []
        soup = BeautifulSoup(html, 'html.parser')
        
        # Look for common grant-related patterns
        potential_grants = soup.find_all(['div', 'article', 'section'], 
                                       string=re.compile(r'grant|funding|application', re.I))
        
        for item in potential_grants[:10]:  # Limit to avoid noise
            try:
                title = self.extract_title_generic(item)
                if title and len(title) > 10:  # Filter out noise
                    grant = Grant(
                        title=title,
                        source=urlparse(base_url).netloc,
                        amount=self.extract_amount(item.get_text()),
                        due_date=self.extract_date(item.get_text()),
                        summary=self.extract_summary(item.get_text()),
                        eligibility=self.extract_eligibility(item.get_text()),
                        tags=self.generate_tags(title + " " + item.get_text()),
                        url=self.extract_url(item, base_url)
                    )
                    
                    grant.score = self.calculate_relevance_score(grant)
                    grant.urgency = self.calculate_urgency(grant.due_date)
                    grants.append(grant)
            except:
                continue
        
        return grants

    def extract_title_generic(self, element) -> str:
        """Extract title from generic element"""
        # Try different heading tags
        for tag in ['h1', 'h2', 'h3', 'h4', 'h5']:
            title_elem = element.find(tag)
            if title_elem:
                return title_elem.get_text(strip=True)
        
        # Try link text
        link = element.find('a')
        if link:
            return link.get_text(strip=True)
        
        return ""

    def deduplicate_grants(self, grants: List[Grant]) -> List[Grant]:
        """Remove duplicate grants based on title similarity"""
        unique_grants = []
        seen_titles = set()
        
        for grant in grants:
            # Simple deduplication based on title
            title_key = re.sub(r'[^\w\s]', '', grant.title.lower()).strip()
            if title_key not in seen_titles:
                seen_titles.add(title_key)
                unique_grants.append(grant)
        
        return unique_grants

    def export_to_csv(self, grants: List[Grant], filename: str = "australian_grants.csv"):
        """Export grants to CSV"""
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['title', 'source', 'amount', 'due_date', 'summary', 
                         'eligibility', 'tags', 'url', 'pdf_url', 'score', 'notes']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for grant in grants:
                row = asdict(grant)
                row['tags'] = ', '.join(row['tags'])  # Convert list to string
                writer.writerow(row)

    def export_to_json(self, grants: List[Grant], filename: str = "australian_grants.json"):
        """Export grants to JSON"""
        grants_data = [asdict(grant) for grant in grants]
        
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(grants_data, jsonfile, indent=2, ensure_ascii=False)

async def main():
    """Main execution function"""
    logger.info("Starting Australian Grant Discovery Scraper...")
    
    async with GrantDiscoveryScraper() as scraper:
        grants = await scraper.scrape_all_sources()
        
        logger.info(f"Total grants discovered: {len(grants)}")
        
        # Filter high-relevance grants
        high_relevance = [g for g in grants if g.score >= 50]
        logger.info(f"High relevance grants (50+ score): {len(high_relevance)}")
        
        # Export results
        scraper.export_to_csv(grants, "australian_grants_full.csv")
        scraper.export_to_csv(high_relevance, "australian_grants_high_relevance.csv")
        scraper.export_to_json(grants, "australian_grants.json")
        
        # Print top 10 grants
        print("\n🏆 TOP 10 MOST RELEVANT GRANTS:")
        print("=" * 80)
        for i, grant in enumerate(grants[:10], 1):
            print(f"{i}. {grant.title}")
            print(f"   Source: {grant.source} | Score: {grant.score} | Amount: {grant.amount}")
            print(f"   Due: {grant.due_date} | Tags: {', '.join(grant.tags)}")
            print(f"   URL: {grant.url}")
            print("-" * 80)

if __name__ == "__main__":
    asyncio.run(main()) 