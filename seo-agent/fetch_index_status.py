"""
Index status of the pages that matter most, straight from Google.

Uses the Search Console URL Inspection API — the same data as pasting a URL
into Search Console's search bar — so the weekly report can say which key
pages are indexed without anyone exporting spreadsheets or taking screenshots.

Needs the service account to have "Full" (or Owner) permission on the Search
Console property; "Restricted" users cannot inspect URLs. Quota is 2,000
inspections a day; TOP_PAGES is ~30.

Never fails the workflow: a page that cannot be inspected is recorded with
its error, and an authentication failure is recorded once so the report can
say "index status not available this week" instead of going silent.
"""
import json
import os
from datetime import datetime, timezone

from config import GOOGLE_SERVICE_ACCOUNT_JSON, GSC_PROPERTY, SITE_URL, TOP_PAGES

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
OUTPUT_PATH = "seo-agent/data/index_status.json"


def inspect_all():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    credentials = service_account.Credentials.from_service_account_info(
        json.loads(GOOGLE_SERVICE_ACCOUNT_JSON), scopes=SCOPES
    )
    service = build("searchconsole", "v1", credentials=credentials, cache_discovery=False)

    pages = []
    for path in TOP_PAGES:
        url = f"{SITE_URL}{path if path != '/' else '/'}"
        entry = {"path": path, "url": url}
        try:
            result = (
                service.urlInspection()
                .index()
                .inspect(body={"inspectionUrl": url, "siteUrl": GSC_PROPERTY, "languageCode": "en-US"})
                .execute()
            )
            status = result.get("inspectionResult", {}).get("indexStatusResult", {})
            entry.update(
                {
                    "verdict": status.get("verdict"),  # PASS / NEUTRAL / FAIL
                    "coverage": status.get("coverageState"),  # e.g. "Submitted and indexed"
                    "last_crawl": status.get("lastCrawlTime"),
                    "fetch": status.get("pageFetchState"),
                    "google_canonical": status.get("googleCanonical"),
                    "user_canonical": status.get("userCanonical"),
                }
            )
        except Exception as error:  # noqa: BLE001 — one page must not stop the rest
            entry["error"] = str(error)[:200]
            if "403" in str(error) or "permission" in str(error).lower():
                pages.append(entry)
                return pages, "Search Console permission nahi mili (service account ko 'Full' permission chahiye)"
        pages.append(entry)
        print(f"  {path}: {entry.get('coverage') or entry.get('error')}")
    return pages, None


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    error = None
    pages = []
    if not GOOGLE_SERVICE_ACCOUNT_JSON:
        error = "GOOGLE_SERVICE_ACCOUNT_JSON set nahi hai"
    else:
        try:
            pages, error = inspect_all()
        except Exception as exc:  # noqa: BLE001
            error = f"Index check nahi chal saka: {str(exc)[:200]}"

    with open(OUTPUT_PATH, "w") as f:
        json.dump(
            {"checked_at": datetime.now(timezone.utc).isoformat(), "error": error, "pages": pages},
            f,
            indent=2,
        )
    indexed = sum(1 for p in pages if p.get("verdict") == "PASS")
    print(f"✅ Index status: {indexed}/{len(pages)} indexed" + (f" — {error}" if error else ""))


if __name__ == "__main__":
    main()
