"""
Create a GitHub Issue with the SEO report.
"""
import os
import json
import requests
from datetime import datetime
from config import GITHUB_REPO, GITHUB_TOKEN


def create_github_issue(report_md):
    """Create a GitHub Issue with the report."""
    token = GITHUB_TOKEN or os.getenv("GITHUB_TOKEN")
    if not token:
        print("❌ GITHUB_TOKEN not set!")
        return None

    today = datetime.now().strftime("%Y-%m-%d")
    title = f"🔍 SEO Report — {today}"

    url = f"https://api.github.com/repos/{GITHUB_REPO}/issues"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    payload = {
        "title": title,
        "body": report_md,
        "labels": ["seo-report", "automated"],
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 201:
        issue = response.json()
        print(f"✅ Issue created: {issue['html_url']}")
        return issue
    else:
        print(f"❌ Failed to create issue: {response.status_code}")
        print(response.text)
        return None


def main():
    """Read report and create issue."""
    report_path = "seo-agent/data/report.md"

    if not os.path.exists(report_path):
        print("❌ Report not found! Run analyze_data.py first.")
        return

    with open(report_path) as f:
        report_md = f.read()

    create_github_issue(report_md)


if __name__ == "__main__":
    main()
