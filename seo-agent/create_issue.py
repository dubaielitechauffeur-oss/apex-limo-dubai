"""
Publish the weekly report as a GitHub issue and close the previous ones.

Only the newest report stays open, so the Issues tab shows one current report
instead of a growing pile (38 had accumulated by Nov 2026). Older reports stay
readable as closed issues.
"""
import json
import os

import github_api

LABEL = "seo-report"


def main():
    report_path = "seo-agent/data/report.md"
    if not os.path.exists(report_path):
        print("❌ Report not found! Run analyze_data.py first.")
        return

    with open(report_path) as f:
        body = f.read()
    title = "📊 Weekly SEO Report"
    meta_path = "seo-agent/data/report_meta.json"
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            title = json.load(f).get("title", title)

    previous = github_api.list_open_issues(LABEL)
    issue = github_api.create_issue(title, body, [LABEL, "automated"])
    if not issue and not github_api.DRY_RUN:
        return

    new_number = issue["number"] if issue else None
    for old in previous:
        if old["number"] != new_number:
            github_api.close_issue(old["number"], f"Nayi report aa gayi: #{new_number}" if new_number else None)
    print(f"Closed {len(previous)} older report issue(s).")


if __name__ == "__main__":
    main()
