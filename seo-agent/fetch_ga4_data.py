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


def fetch_sources(client, start_date, end_date):
    """Sessions per source (google, bing, chatgpt.com, (direct), ...)."""
    return run_report(client, ["sessionSource"], ["sessions"], start_date, end_date, limit=100)


def fetch_leads(client, start_date, end_date):
    """`generate_lead` events — every WhatsApp/phone click and booking/quote/
    contact form success (lib/analytics.ts). Split by `lead_source` when that
    parameter is registered as a custom dimension in GA4; otherwise the total
    alone."""
    total = sum(
        int(r["eventCount"])
        for r in run_report(client, ["eventName"], ["eventCount"], start_date, end_date, limit=200)
        if r["eventName"] == "generate_lead"
    )
    by_channel = {}
    try:
        for r in run_report(client, ["eventName", "customEvent:lead_source"], ["eventCount"], start_date, end_date, limit=200):
            if r["eventName"] == "generate_lead":
                by_channel[r["customEvent:lead_source"]] = int(r["eventCount"])
    except Exception:  # noqa: BLE001 — dimension not registered; total is still useful
        by_channel = {}
    return {"total": total, "by_channel": by_channel}


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

    end = datetime.now() - timedelta(days=1)
    week = (end - timedelta(days=6)).strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")
    prev_week = (end - timedelta(days=13)).strftime("%Y-%m-%d"), (end - timedelta(days=7)).strftime("%Y-%m-%d")

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
        "weekly": {
            "week": {"start": week[0], "end": week[1], "sources": fetch_sources(client, *week), "leads": fetch_leads(client, *week)},
            "prev_week": {"start": prev_week[0], "end": prev_week[1], "sources": fetch_sources(client, *prev_week), "leads": fetch_leads(client, *prev_week)},
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
    try:
        fetch_all_ga4_data()
    except Exception as error:  # noqa: BLE001 — see fetch_gsc_data.py
        os.makedirs("seo-agent/data", exist_ok=True)
        with open("seo-agent/data/ga4_data.json", "w") as f:
            json.dump({"error": str(error)[:300], "fetched_at": datetime.now().isoformat()}, f)
        print(f"❌ GA4 fetch failed: {error}")
