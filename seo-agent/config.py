"""
SEO Agent Configuration
Apex Limo & Chauffeur Dubai
"""
import os

# ─── Site Config ───
SITE_URL = "https://apexchauffeurdubai.com"
SITE_NAME = "Apex Limo & Chauffeur Dubai"

# ─── Google Search Console ───
GSC_PROPERTY = os.getenv("GSC_PROPERTY", "sc-domain:apexchauffeurdubai.com")
# Alternative format: "https://apexchauffeurdubai.com/"

# ─── GA4 ───
GA4_PROPERTY_ID = os.getenv("GA4_PROPERTY_ID", "")  # e.g., "properties/123456789"

# ─── Google Auth ───
# Service account JSON key (stored as GitHub Secret → env var)
GOOGLE_SERVICE_ACCOUNT_JSON = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "")

# ─── GitHub ───
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GITHUB_REPO = os.getenv("GITHUB_REPOSITORY", "dubaielitechauffeur-oss/apex-limo-dubai")

# ─── Analysis Thresholds ───
THRESHOLDS = {
    "low_ctr_position": 10,       # Pages ranking in top 10 but low CTR
    "low_ctr_percent": 2.0,       # CTR below this % is "low"
    "declining_clicks_percent": 20,  # >20% drop = declining
    "high_bounce_rate": 70,       # Bounce rate above 70% = issue
    "low_session_duration": 30,   # Less than 30 seconds = issue
    "min_impressions": 50,        # Minimum impressions to consider
    "data_days": 28,              # Days of data to fetch
    "compare_days": 28,           # Previous period for comparison
}

# ─── Pages to monitor (your Apex Limo pages) ───
KEY_PAGES = [
    "/",
    "/about",
    "/contact",
    "/booking",
    # Services
    "/services/airport-transfer",
    "/services/corporate-chauffeur",
    "/services/city-tour",
    "/services/intercity-transfer",
    "/services/event-chauffeur",
    "/services/hourly-chauffeur",
    # Fleet
    "/fleet/mercedes-s-class",
    "/fleet/mercedes-v-class",
    "/fleet/bmw-7-series",
    "/fleet/range-rover",
    "/fleet/rolls-royce-phantom",
    "/fleet/cadillac-escalade",
    # Locations
    "/locations/dubai-marina",
    "/locations/downtown-dubai",
    "/locations/palm-jumeirah",
    "/locations/business-bay",
    "/locations/dxb-airport",
    "/locations/dwc-airport",
]
