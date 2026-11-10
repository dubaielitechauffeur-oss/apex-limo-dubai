"""
Minimal GitHub Issues helper shared by the SEO report and the site health check.

Set DRY_RUN=1 to print what would be sent instead of calling GitHub — used to
test the agent locally without opening real issues.
"""
import os

import requests

from config import GITHUB_REPO, GITHUB_TOKEN

API = f"https://api.github.com/repos/{GITHUB_REPO}"
DRY_RUN = os.getenv("DRY_RUN") == "1"


def _headers():
    token = GITHUB_TOKEN or os.getenv("GITHUB_TOKEN")
    if not token and not DRY_RUN:
        raise RuntimeError("GITHUB_TOKEN is not set")
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def _request(method, path, **kwargs):
    if DRY_RUN:
        body = kwargs.get("json", {})
        preview = {k: (v[:300] + "…" if isinstance(v, str) and len(v) > 300 else v) for k, v in body.items()}
        print(f"[dry-run] {method} {path} {preview}")
        return None
    response = requests.request(method, f"{API}{path}", headers=_headers(), timeout=30, **kwargs)
    response.raise_for_status()
    return response.json() if response.content else None


def list_open_issues(label):
    """Open issues carrying `label`, newest first (pull requests excluded)."""
    if DRY_RUN:
        return []
    issues, page = [], 1
    while True:
        batch = _request("GET", "/issues", params={"state": "open", "labels": label, "per_page": 100, "page": page})
        batch = [i for i in (batch or []) if "pull_request" not in i]
        issues.extend(batch)
        if len(batch) < 100:
            return issues
        page += 1


def latest_issue(label, state="all"):
    """The most recently created issue with `label`, or None."""
    if DRY_RUN:
        return None
    batch = _request("GET", "/issues", params={"state": state, "labels": label, "per_page": 5, "sort": "created", "direction": "desc"})
    batch = [i for i in (batch or []) if "pull_request" not in i]
    return batch[0] if batch else None


def create_issue(title, body, labels):
    issue = _request("POST", "/issues", json={"title": title, "body": body, "labels": labels})
    if issue:
        print(f"✅ Issue created: {issue['html_url']}")
    return issue


def update_issue(number, **fields):
    return _request("PATCH", f"/issues/{number}", json=fields)


def comment(number, body):
    return _request("POST", f"/issues/{number}/comments", json={"body": body})


def close_issue(number, note=None):
    if note:
        comment(number, note)
    return update_issue(number, state="closed", state_reason="completed")
