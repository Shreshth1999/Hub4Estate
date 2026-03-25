"""
IndiaMART Dealer Data Scraper
Hub4Estate Competitive Intelligence Tool

Collects publicly available dealer data from IndiaMART:
- State / City / Category breakdown
- Dealer names, locations, product categories
- Rating and verification status

Output: CSV files in ./data/ directory
Usage:  python indiamart_scraper.py [--state GUJARAT] [--category "steel pipes"] [--limit 500]

NOTE: Respects rate limits. Uses publicly visible search pages only.
      Do not run more than 1 req/sec to avoid IP blocks.
"""

import requests
import csv
import json
import time
import random
import argparse
import os
import logging
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlencode, quote_plus

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

# ─── CONSTANTS ────────────────────────────────────────────────────────────────

BASE_URL = "https://www.indiamart.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
}

# All Indian states with IndiaMART search slugs
STATES = {
    "Andhra Pradesh":   "andhra-pradesh",
    "Assam":            "assam",
    "Bihar":            "bihar",
    "Chhattisgarh":     "chhattisgarh",
    "Delhi":            "delhi",
    "Goa":              "goa",
    "Gujarat":          "gujarat",
    "Haryana":          "haryana",
    "Himachal Pradesh": "himachal-pradesh",
    "Jharkhand":        "jharkhand",
    "Karnataka":        "karnataka",
    "Kerala":           "kerala",
    "Madhya Pradesh":   "madhya-pradesh",
    "Maharashtra":      "maharashtra",
    "Manipur":          "manipur",
    "Odisha":           "odisha",
    "Punjab":           "punjab",
    "Rajasthan":        "rajasthan",
    "Tamil Nadu":       "tamil-nadu",
    "Telangana":        "telangana",
    "Uttar Pradesh":    "uttar-pradesh",
    "Uttarakhand":      "uttarakhand",
    "West Bengal":      "west-bengal",
}

# Key Tier-2 / Tier-3 industrial cities (Hub4Estate target markets)
TIER2_CITIES = [
    # Rajasthan
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner",
    "Sriganganagar", "Hanumangarh", "Alwar", "Bhilwara", "Sikar",
    "Ajmer", "Abohar",
    # Punjab
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda",
    "Moga", "Firozpur", "Pathankot", "Khanna",
    # Haryana
    "Faridabad", "Gurgaon", "Panipat", "Hisar", "Rohtak",
    "Karnal", "Sonipat", "Yamunanagar", "Bhiwani",
    # Gujarat
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Morbi", "Anand", "Vapi", "Bharuch", "Gandhinagar",
    # Maharashtra
    "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
    "Solapur", "Kolhapur", "Amravati", "Nanded",
    # Uttar Pradesh
    "Kanpur", "Lucknow", "Agra", "Varanasi", "Meerut",
    "Aligarh", "Moradabad", "Gorakhpur", "Ghaziabad", "Noida",
    # Madhya Pradesh
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain",
    "Ratlam", "Pithampur",
    # Tamil Nadu
    "Chennai", "Coimbatore", "Madurai", "Tiruppur", "Salem",
    "Erode", "Vellore", "Tirunelveli",
    # Karnataka
    "Bengaluru", "Hubli", "Mangalore", "Belgaum", "Mysore",
    # West Bengal
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
]

# Product categories Hub4Estate focuses on (industrial B2B)
CATEGORIES = [
    "ms pipes",
    "gi pipes",
    "pvc pipes",
    "electrical cables",
    "steel bars",
    "cement",
    "motors",
    "pumps",
    "industrial valves",
    "switchgear",
    "transformers",
    "circuit breakers",
    "wire mesh",
    "ms angles",
    "ms channels",
    "cold rolled sheets",
    "hot rolled sheets",
    "industrial fans",
    "bearings",
    "bolts nuts fasteners",
    "industrial paint",
    "welding electrodes",
    "hydraulic cylinders",
    "conveyor belts",
    "industrial filters",
    "solar panels",
    "inverters",
    "batteries industrial",
    "hand tools",
    "safety equipment",
]


# ─── SCRAPER ──────────────────────────────────────────────────────────────────

class IndiaMArtScraper:
    def __init__(self, delay_min=1.2, delay_max=2.8, output_dir="./data"):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.delay_min = delay_min
        self.delay_max = delay_max
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.results = []

    def _sleep(self):
        """Rate limiting — stay polite."""
        t = random.uniform(self.delay_min, self.delay_max)
        time.sleep(t)

    def _get(self, url, retries=3):
        for attempt in range(retries):
            try:
                r = self.session.get(url, timeout=15)
                if r.status_code == 200:
                    return r
                elif r.status_code == 429:
                    log.warning("Rate limited. Sleeping 30s.")
                    time.sleep(30)
                elif r.status_code == 403:
                    log.warning(f"403 Forbidden: {url}")
                    return None
                else:
                    log.warning(f"HTTP {r.status_code} for {url}")
            except requests.RequestException as e:
                log.error(f"Request error (attempt {attempt+1}): {e}")
                time.sleep(5)
        return None

    def search_dealers(self, query, location=None, page=1):
        """
        Search IndiaMART for dealers matching query + optional location.
        Returns list of dealer dicts.
        """
        params = {
            "ss": query,
            "filter": "seller",
        }
        if location:
            params["loc"] = location

        if page > 1:
            params["bfq"] = str((page - 1) * 20)

        url = f"{BASE_URL}/search.mp?" + urlencode(params)
        log.info(f"Fetching: {url}")

        r = self._get(url)
        if not r:
            return []

        soup = BeautifulSoup(r.text, "html.parser")
        dealers = []

        # IndiaMART search results use various class names — try multiple selectors
        # Seller card containers
        cards = (
            soup.find_all("div", class_="lst-tle-wrap") or
            soup.find_all("div", {"class": lambda c: c and "seller" in c.lower()}) or
            soup.find_all("li", {"class": lambda c: c and "product" in c.lower()})
        )

        if not cards:
            # Fallback: look for common seller data patterns
            cards = soup.find_all("div", attrs={"data-cid": True})

        for card in cards[:20]:
            d = self._parse_dealer_card(card, query, location)
            if d:
                dealers.append(d)

        log.info(f"  Found {len(dealers)} dealers on page {page}")
        return dealers

    def _parse_dealer_card(self, card, query, location):
        """Extract structured data from a dealer card element."""
        try:
            d = {
                "query_category": query,
                "query_location": location or "",
                "scraped_at": datetime.now().isoformat(),
                "name": "",
                "city": "",
                "state": "",
                "contact": "",
                "rating": "",
                "reviews": "",
                "verified": "",
                "response_rate": "",
                "membership": "",
                "products": "",
                "profile_url": "",
            }

            # Company name
            name_el = (
                card.find("a", class_="lcname") or
                card.find("span", class_="mTxt") or
                card.find("a", {"class": lambda c: c and "name" in str(c).lower()}) or
                card.find("h3")
            )
            if name_el:
                d["name"] = name_el.get_text(strip=True)

            # Location
            loc_el = (
                card.find("span", class_="location") or
                card.find("div", class_="lcadr") or
                card.find("span", {"class": lambda c: c and "city" in str(c).lower()}) or
                card.find("span", {"itemprop": "addressLocality"})
            )
            if loc_el:
                loc_text = loc_el.get_text(strip=True)
                # Try to split city, state
                parts = [p.strip() for p in loc_text.split(",")]
                if len(parts) >= 2:
                    d["city"] = parts[0]
                    d["state"] = parts[1]
                else:
                    d["city"] = loc_text

            # Rating
            rating_el = card.find("span", class_="star-count") or card.find("span", {"class": lambda c: c and "rating" in str(c).lower()})
            if rating_el:
                d["rating"] = rating_el.get_text(strip=True)

            # Profile URL
            link_el = card.find("a", href=True)
            if link_el and link_el.get("href", "").startswith("/"):
                d["profile_url"] = BASE_URL + link_el["href"]

            # Membership/Verification badge
            trust_el = (
                card.find("span", class_="trust-badge") or
                card.find("img", {"alt": lambda a: a and "trust" in str(a).lower()}) or
                card.find("span", {"class": lambda c: c and "verify" in str(c).lower()})
            )
            if trust_el:
                d["verified"] = "Yes"

            # Skip entries with no name
            if not d["name"]:
                return None

            return d
        except Exception as e:
            log.debug(f"Parse error: {e}")
            return None

    def scrape_city(self, city, categories=None, max_pages=5):
        """Scrape all dealers in a specific city across all/given categories."""
        cats = categories or CATEGORIES
        city_results = []

        for cat in cats:
            log.info(f"  [{city}] Scraping category: {cat}")
            for page in range(1, max_pages + 1):
                dealers = self.search_dealers(cat, location=city, page=page)
                if not dealers:
                    break
                for d in dealers:
                    d["query_city_explicit"] = city
                city_results.extend(dealers)
                self._sleep()
            self._sleep()

        log.info(f"[{city}] Total: {len(city_results)} records")
        return city_results

    def scrape_state(self, state_name, categories=None, max_pages=3):
        """Scrape dealers for an entire state."""
        state_slug = STATES.get(state_name, state_name.lower().replace(" ", "-"))
        cats = categories or CATEGORIES[:10]  # subset for state-level
        state_results = []

        for cat in cats:
            log.info(f"  [{state_name}] Scraping: {cat}")
            for page in range(1, max_pages + 1):
                dealers = self.search_dealers(cat, location=state_slug, page=page)
                if not dealers:
                    break
                for d in dealers:
                    d["state"] = d["state"] or state_name
                state_results.extend(dealers)
                self._sleep()
            self._sleep()

        return state_results

    def scrape_all_tier2_cities(self, categories=None, max_pages=3, limit_cities=None):
        """Full sweep of all Tier-2/3 target cities."""
        cities = TIER2_CITIES[:limit_cities] if limit_cities else TIER2_CITIES
        all_results = []

        for i, city in enumerate(cities):
            log.info(f"\n=== [{i+1}/{len(cities)}] CITY: {city} ===")
            results = self.scrape_city(city, categories=categories, max_pages=max_pages)
            all_results.extend(results)
            self.save_csv(all_results, "indiamart_all_cities_partial.csv")  # incremental save
            self._sleep()

        return all_results

    def save_csv(self, data, filename):
        """Save results to CSV."""
        if not data:
            log.warning("No data to save.")
            return

        path = os.path.join(self.output_dir, filename)
        fieldnames = list(data[0].keys())

        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)

        log.info(f"Saved {len(data)} records → {path}")

    def save_json(self, data, filename):
        """Save results to JSON."""
        path = os.path.join(self.output_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        log.info(f"Saved {len(data)} records → {path}")

    def generate_summary(self, data):
        """Generate city/state/category breakdown summary."""
        summary = {
            "total_records": len(data),
            "by_state": {},
            "by_city": {},
            "by_category": {},
            "scraped_at": datetime.now().isoformat(),
        }

        for d in data:
            state = d.get("state", "Unknown")
            city = d.get("city", "Unknown")
            cat = d.get("query_category", "Unknown")

            summary["by_state"][state] = summary["by_state"].get(state, 0) + 1
            summary["by_city"][city] = summary["by_city"].get(city, 0) + 1
            summary["by_category"][cat] = summary["by_category"].get(cat, 0) + 1

        # Sort descending
        summary["by_state"] = dict(sorted(summary["by_state"].items(), key=lambda x: -x[1]))
        summary["by_city"] = dict(sorted(summary["by_city"].items(), key=lambda x: -x[1]))
        summary["by_category"] = dict(sorted(summary["by_category"].items(), key=lambda x: -x[1]))

        return summary


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="IndiaMART Dealer Scraper")
    parser.add_argument("--mode", choices=["city", "state", "all-tier2", "category"], default="all-tier2",
                        help="Scrape mode")
    parser.add_argument("--city", type=str, help="Specific city to scrape")
    parser.add_argument("--state", type=str, help="Specific state to scrape")
    parser.add_argument("--category", type=str, help="Specific category to scrape")
    parser.add_argument("--pages", type=int, default=3, help="Max pages per search")
    parser.add_argument("--limit-cities", type=int, default=None, help="Limit number of cities (for testing)")
    parser.add_argument("--output", type=str, default="./data", help="Output directory")
    args = parser.parse_args()

    scraper = IndiaMArtScraper(output_dir=args.output)

    ts = datetime.now().strftime("%Y%m%d_%H%M")

    if args.mode == "city" and args.city:
        cats = [args.category] if args.category else None
        data = scraper.scrape_city(args.city, categories=cats, max_pages=args.pages)
        fname = f"indiamart_{args.city.lower().replace(' ','_')}_{ts}"
        scraper.save_csv(data, fname + ".csv")
        scraper.save_json(data, fname + ".json")

    elif args.mode == "state" and args.state:
        cats = [args.category] if args.category else None
        data = scraper.scrape_state(args.state, categories=cats, max_pages=args.pages)
        fname = f"indiamart_{args.state.lower().replace(' ','_')}_{ts}"
        scraper.save_csv(data, fname + ".csv")
        scraper.save_json(data, fname + ".json")

    elif args.mode == "category" and args.category:
        all_data = []
        for city in TIER2_CITIES[:20]:
            results = scraper.scrape_city(city, categories=[args.category], max_pages=args.pages)
            all_data.extend(results)
        fname = f"indiamart_cat_{args.category.replace(' ','_')}_{ts}"
        scraper.save_csv(all_data, fname + ".csv")

    else:  # all-tier2 (default)
        cats = [args.category] if args.category else None
        data = scraper.scrape_all_tier2_cities(
            categories=cats,
            max_pages=args.pages,
            limit_cities=args.limit_cities,
        )
        fname = f"indiamart_all_tier2_{ts}"
        scraper.save_csv(data, fname + ".csv")
        scraper.save_json(data, fname + ".json")
        summary = scraper.generate_summary(data)
        scraper.save_json(summary, f"indiamart_summary_{ts}.json")
        print("\n=== SUMMARY ===")
        print(f"Total records: {summary['total_records']}")
        print("\nTop 10 Cities:")
        for city, count in list(summary['by_city'].items())[:10]:
            print(f"  {city:<25} {count:>5}")
        print("\nTop 10 States:")
        for state, count in list(summary['by_state'].items())[:10]:
            print(f"  {state:<25} {count:>5}")

    log.info("Done.")


if __name__ == "__main__":
    main()
