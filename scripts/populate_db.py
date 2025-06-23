import os
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase environment variables")

supabase: Client = create_client(supabase_url, supabase_key)

def scrape_grants(url: str) -> list:
    """
    Scrape grant information from the specified URL.
    Modify this function according to the specific website structure.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        grants = []

        # Example scraping logic - modify according to the target website
        grant_elements = soup.find_all('div', class_='grant-listing')  # Adjust selector
        
        for element in grant_elements:
            grant = {
                'name': element.find('h2').text.strip(),  # Adjust selectors
                'funder': element.find('div', class_='funder').text.strip(),
                'source_url': url,
                'amount_string': element.find('div', class_='amount').text.strip(),
                'description': element.find('div', class_='description').text.strip(),
                'status': 'potential'
            }
            
            # Try to parse due date if available
            due_date_elem = element.find('div', class_='due-date')
            if due_date_elem:
                try:
                    date_str = due_date_elem.text.strip()
                    grant['due_date'] = datetime.strptime(date_str, '%Y-%m-%d').isoformat()
                except ValueError:
                    logger.warning(f"Could not parse date: {date_str}")

            grants.append(grant)

        return grants
    except requests.RequestException as e:
        logger.error(f"Error scraping URL {url}: {str(e)}")
        return []

def insert_grants(grants: list) -> None:
    """
    Insert scraped grants into Supabase database.
    """
    try:
        for grant in grants:
            # Check if grant already exists (based on name and funder)
            existing = supabase.table('grants') \
                .select('id') \
                .eq('name', grant['name']) \
                .eq('funder', grant['funder']) \
                .execute()

            if not existing.data:
                result = supabase.table('grants').insert(grant).execute()
                logger.info(f"Inserted grant: {grant['name']}")
            else:
                logger.info(f"Grant already exists: {grant['name']}")

    except Exception as e:
        logger.error(f"Error inserting grants: {str(e)}")

def main():
    # List of URLs to scrape
    urls = [
        "https://example.com/grants",  # Replace with actual grant listing URLs
        # Add more URLs as needed
    ]

    for url in urls:
        logger.info(f"Scraping grants from {url}")
        grants = scrape_grants(url)
        logger.info(f"Found {len(grants)} grants")
        insert_grants(grants)

if __name__ == "__main__":
    main() 