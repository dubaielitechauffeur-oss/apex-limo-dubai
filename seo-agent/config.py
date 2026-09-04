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
# e.g. "properties/123456789". Left unset the GA4 fetch silently returned
# nothing and the report looked like a site with zero traffic, so the absence
# is surfaced at import time instead of being defaulted away.
GA4_PROPERTY_ID = os.getenv("GA4_PROPERTY_ID", "")
if not GA4_PROPERTY_ID:
    print("[config] GA4_PROPERTY_ID is not set — GA4 metrics will be empty in this run.")

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

# ─── Pages to monitor ───
#
# Derived from the site's own sitemap.xml rather than maintained by hand.
#
# The previous hardcoded list had drifted badly: it named twelve URLs that had
# never existed (/services/city-tour, /services/hourly-chauffeur,
# /locations/dxb-airport, /fleet/range-rover, ...), missed nine of the fifteen
# vehicles, all five fleet category pages, /quote, /faqs and /blog, and knew
# about none of the five non-English locales. The agent therefore reported
# "not appearing in search results" for pages that do not exist, while never
# looking at the 250+ real URLs.
#
# The sitemap is generated from the same CMS + route definitions the site
# renders, so this cannot drift again. The static list below is only a
# fallback for when the sitemap cannot be fetched (network failure in CI), and
# is deliberately limited to the handful of top-level routes that are fixed
# route segments rather than content rows.

FALLBACK_KEY_PAGES = [
    "/",
    "/fleet",
    "/services",
    "/locations",
    "/blog",
    "/faqs",
    "/about",
    "/contact",
    "/booking",
    "/quote",
]

# Locale prefixes the site serves. English is unprefixed ("as-needed" routing
# in i18n/routing.ts), the other five carry a prefix.
LOCALE_PREFIXES = ["", "/ar", "/ru", "/zh", "/fr", "/de"]


def _paths_from_sitemap(sitemap_url, timeout=20):
    """Every path in the sitemap, locale prefix included, deduplicated."""
    import urllib.request
    import xml.etree.ElementTree as ET
    from urllib.parse import urlparse

    with urllib.request.urlopen(sitemap_url, timeout=timeout) as response:
        root = ET.fromstring(response.read())

    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    paths = []
    for loc in root.findall(".//sm:url/sm:loc", ns):
        if not loc.text:
            continue
        path = urlparse(loc.text.strip()).path or "/"
        if path != "/" and path.endswith("/"):
            path = path.rstrip("/")
        paths.append(path)

    # Stable order, no duplicates — the agent iterates this list every run and
    # a churning order makes report diffs unreadable.
    return sorted(set(paths))


def load_key_pages():
    """Pages the agent monitors. Sitemap first, static fallback on failure."""
    try:
        paths = _paths_from_sitemap(f"{SITE_URL}/sitemap.xml")
        if paths:
            return paths
        print("[config] sitemap returned no URLs; using fallback list")
    except Exception as error:  # noqa: BLE001 - any fetch/parse failure is non-fatal
        print(f"[config] could not read sitemap ({error}); using fallback list")

    return [
        f"{prefix}{path}" if path != "/" else (prefix or "/")
        for prefix in LOCALE_PREFIXES
        for path in FALLBACK_KEY_PAGES
    ]


KEY_PAGES = load_key_pages()
