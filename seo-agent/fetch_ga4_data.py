"""
Fetch Google Analytics 4 data via GA4 Data API
"""
import json
import os
from datetime import datetime, timedelta
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest,
    DateRange,
    Dimension,
    Metric,
    OrderBy,
)
from config import GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_JSON, THRESHOLDS

SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]


def get_ga4_client():
    """Authenticate and return GA4 client."""
    creds_json = json.loads(GOOGLE_SERVICE_ACCOUNT_JSON)
    credentials = service_account.Credentials.from_service_account_info(
        creds_json, scopes=SCOPES
    )
    return BetaAnalyticsDataClient(credentials=credentials)


def run_report(client, dimensions, metrics, start_date, end_date, limit=500):
    """Run a GA4 report."""
    request = RunReportRequest(
        property=GA4_PROPERTY_ID,
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[Dimension(name=d) for d in dimensions],
        metrics=[Metric(name=m) for m in metrics],
        limit=limit,
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name=metrics[0]), desc=True)],
    )
    response = client.run_report(request)

    rows = []
    for row in response.rows:
        entry = {}
        for i, dim in enumerate(dimensions):
            entry[dim] = row.dimension_values[i].value
        for i, met in enumerate(metrics):
            entry[met] = row.metric_values[i].value
        rows.append(entry)
    return rows


def fetch_page_metrics(client, start_date, end_date):
    """Fetch per-page metrics: sessions, bounce rate, engagement."""
    return run_report(
        client,
        dimensions=["pagePath", "pageTitle"],
        metrics=[
            "sessions",
            "bounceRate",
            "averageSessionDuration",
            "engagedSessions",
            "screenPageViews",
            "conversions",
        ],
        start_date=start_date,
        end_date=end_date,
    )


def fetch_traffic_sources(client, start_date, end_date):
    """Fetch traffic source breakdown."""
    return run_report(
        client,
        dimensions=["sessionDefaultChannelGroup", "pagePath"],
        metrics=["sessions", "conversions", "bounceRate"],
        start_date=start_date,
        end_date=end_date,
    )


def fetch_device_breakdown(client, start_date, end_date):
    """Fetch device category breakdown."""
    return run_report(
        client,
        dimensions=["deviceCategory", "pagePath"],
        metrics=["sessions", "bounceRate", "averageSessionDuration"],
        start_date=start_date,
        end_date=end_date,
    )


def fetch_landing_pages(client, start_date, end_date):
    """Fetch landing page performance."""
    return run_report(
        client,
        dimensions=["landingPage"],
        metrics=[
            "sessions",
            "bounceRate",
            "averageSessionDuration",
            "conversions",
            "engagedSessions",
        ],
        start_date=start_date,
        end_date=end_date,
    )


def fetch_all_ga4_data():
    """Fetch all GA4 data."""
    client = get_ga4_client()

    days = THRESHOLDS["data_days"]
    end_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=1 + days)).strftime("%Y-%m-%d")

    prev_end = (datetime.now() - timedelta(days=1 + days)).strftime("%Y-%m-%d")
    prev_start = (
        datetime.now() - timedelta(days=1 + days + THRESHOLDS["compare_days"])
    ).strftime("%Y-%m-%d")

    print(f"📈 Fetching GA4 data: {start_date} → {end_date}")

    data = {
        "period": {"start": start_date, "end": end_date},
        "prev_period": {"start": prev_start, "end": prev_end},
        "current": {
            "pages": fetch_page_metrics(client, start_date, end_date),
            "traffic_sources": fetch_traffic_sources(client, start_date, end_date),
            "devices": fetch_device_breakdown(client, start_date, end_date),
            "landing_pages": fetch_landing_pages(client, start_date, end_date),
        },
        "previous": {
            "pages": fetch_page_metrics(client, prev_start, prev_end),
            "landing_pages": fetch_landing_pages(client, prev_start, prev_end),
        },
        "fetched_at": datetime.now().isoformat(),
    }

    os.makedirs("seo-agent/data", exist_ok=True)
    output_path = "seo-agent/data/ga4_data.json"
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"✅ GA4 data saved to {output_path}")
    print(f"   {len(data['current']['pages'])} page entries")

    return data


if __name__ == "__main__":
    fetch_all_ga4_data()
