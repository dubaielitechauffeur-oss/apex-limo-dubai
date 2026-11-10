"""
Fetch Google Search Console data via API
"""
import json
import os
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build
from config import GSC_PROPERTY, GOOGLE_SERVICE_ACCOUNT_JSON, THRESHOLDS

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]


def get_gsc_service():
    """Authenticate and return GSC service."""
    creds_json = json.loads(GOOGLE_SERVICE_ACCOUNT_JSON)
    credentials = service_account.Credentials.from_service_account_info(
        creds_json, scopes=SCOPES
    )
    return build("searchconsole", "v1", credentials=credentials)


def fetch_search_analytics(service, start_date, end_date, dimensions=None):
    """Fetch search analytics data."""
    if dimensions is None:
        dimensions = ["page", "query"]

    body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": dimensions,
        "rowLimit": 1000,
        "startRow": 0,
    }

    response = (
        service.searchanalytics()
        .query(siteUrl=GSC_PROPERTY, body=body)
        .execute()
    )
    return response.get("rows", [])


def fetch_page_performance(service, start_date, end_date):
    """Fetch per-page performance."""
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": ["page"],
        "rowLimit": 500,
    }
    response = (
        service.searchanalytics()
        .query(siteUrl=GSC_PROPERTY, body=body)
        .execute()
    )
    return response.get("rows", [])


def fetch_query_performance(service, start_date, end_date):
    """Fetch per-query performance."""
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": ["query"],
        "rowLimit": 500,
    }
    response = (
        service.searchanalytics()
        .query(siteUrl=GSC_PROPERTY, body=body)
        .execute()
    )
    return response.get("rows", [])


def fetch_totals(service, start_date, end_date):
    """Site-wide clicks/impressions/CTR/position for a date range (no dimensions)."""
    body = {"startDate": start_date, "endDate": end_date}
    rows = service.searchanalytics().query(siteUrl=GSC_PROPERTY, body=body).execute().get("rows", [])
    row = rows[0] if rows else {}
    return {
        "start": start_date,
        "end": end_date,
        "clicks": row.get("clicks", 0),
        "impressions": row.get("impressions", 0),
        "ctr": row.get("ctr", 0),
        "position": row.get("position", 0),
    }


def fetch_all_gsc_data():
    """Fetch all GSC data for current and previous period."""
    service = get_gsc_service()

    end_date = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")
    start_date = (
        datetime.now() - timedelta(days=3 + THRESHOLDS["data_days"])
    ).strftime("%Y-%m-%d")

    prev_end = (
        datetime.now() - timedelta(days=3 + THRESHOLDS["data_days"])
    ).strftime("%Y-%m-%d")
    prev_start = (
        datetime.now()
        - timedelta(days=3 + THRESHOLDS["data_days"] + THRESHOLDS["compare_days"])
    ).strftime("%Y-%m-%d")

    # Week-on-week windows for the weekly report. Search Console data lags
    # ~2-3 days, so "this week" ends at the same 3-day-old date as above.
    end = datetime.now() - timedelta(days=3)
    week = (end - timedelta(days=6)).strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")
    prev_week = (end - timedelta(days=13)).strftime("%Y-%m-%d"), (end - timedelta(days=7)).strftime("%Y-%m-%d")

    print(f"📊 Fetching GSC data: {start_date} → {end_date}")
    print(f"📊 Comparison period: {prev_start} → {prev_end}")

    data = {
        "period": {"start": start_date, "end": end_date},
        "prev_period": {"start": prev_start, "end": prev_end},
        "current": {
            "pages": fetch_page_performance(service, start_date, end_date),
            "queries": fetch_query_performance(service, start_date, end_date),
            "page_query": fetch_search_analytics(service, start_date, end_date),
        },
        "previous": {
            "pages": fetch_page_performance(service, prev_start, prev_end),
            "queries": fetch_query_performance(service, prev_start, prev_end),
        },
        "totals": {
            "week": fetch_totals(service, *week),
            "prev_week": fetch_totals(service, *prev_week),
            "days28": fetch_totals(service, start_date, end_date),
            "prev_days28": fetch_totals(service, prev_start, prev_end),
        },
        "fetched_at": datetime.now().isoformat(),
    }

    # Save to file
    os.makedirs("seo-agent/data", exist_ok=True)
    output_path = "seo-agent/data/gsc_data.json"
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"✅ GSC data saved to {output_path}")
    print(f"   Current period: {len(data['current']['pages'])} pages, {len(data['current']['queries'])} queries")

    return data


if __name__ == "__main__":
    try:
        fetch_all_gsc_data()
    except Exception as error:  # noqa: BLE001
        # Record the failure instead of killing the run: the weekly report then
        # says "Search Console data nahi mila" rather than not appearing at all,
        # which is how a lost permission went unnoticed for a week in Nov 2026.
        os.makedirs("seo-agent/data", exist_ok=True)
        with open("seo-agent/data/gsc_data.json", "w") as f:
            json.dump({"error": str(error)[:300], "fetched_at": datetime.now().isoformat()}, f)
        print(f"❌ GSC fetch failed: {error}")
