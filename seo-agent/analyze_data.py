"""
Analyze GSC + GA4 data and generate SEO report.
Identifies issues and suggests fixes.
"""
import json
import os
from datetime import datetime
from config import SITE_URL, SITE_NAME, THRESHOLDS, KEY_PAGES


def load_data():
    """Load fetched GSC and GA4 data."""
    gsc_data, ga4_data = None, None

    gsc_path = "seo-agent/data/gsc_data.json"
    ga4_path = "seo-agent/data/ga4_data.json"

    if os.path.exists(gsc_path):
        with open(gsc_path) as f:
            gsc_data = json.load(f)

    if os.path.exists(ga4_path):
        with open(ga4_path) as f:
            ga4_data = json.load(f)

    return gsc_data, ga4_data


def extract_path(url):
    """Extract path from full URL."""
    if url.startswith("http"):
        from urllib.parse import urlparse
        return urlparse(url).path.rstrip("/") or "/"
    return url.rstrip("/") or "/"


def analyze_low_ctr_pages(gsc_data):
    """Pages ranking well but low CTR → needs better title/description."""
    issues = []
    if not gsc_data:
        return issues

    for row in gsc_data["current"]["pages"]:
        page = extract_path(row["keys"][0])
        position = row.get("position", 100)
        ctr = row.get("ctr", 0) * 100  # API returns as decimal
        impressions = row.get("impressions", 0)

        if (
            position <= THRESHOLDS["low_ctr_position"]
            and ctr < THRESHOLDS["low_ctr_percent"]
            and impressions >= THRESHOLDS["min_impressions"]
        ):
            issues.append({
                "page": page,
                "issue": "Low CTR despite good ranking",
                "severity": "HIGH",
                "details": f"Position: {position:.1f}, CTR: {ctr:.1f}%, Impressions: {impressions}",
                "fix": "Improve meta title & description to be more compelling. Add rich snippets (FAQ schema, review stars).",
            })
    return issues


def analyze_declining_pages(gsc_data):
    """Pages losing clicks compared to previous period."""
    issues = []
    if not gsc_data:
        return issues

    current_pages = {
        extract_path(r["keys"][0]): r for r in gsc_data["current"]["pages"]
    }
    prev_pages = {
        extract_path(r["keys"][0]): r for r in gsc_data["previous"]["pages"]
    }

    for page, curr in current_pages.items():
        if page in prev_pages:
            prev = prev_pages[page]
            curr_clicks = curr.get("clicks", 0)
            prev_clicks = prev.get("clicks", 0)

            if prev_clicks > 0:
                change_pct = ((curr_clicks - prev_clicks) / prev_clicks) * 100
                if change_pct < -THRESHOLDS["declining_clicks_percent"]:
                    issues.append({
                        "page": page,
                        "issue": "Declining clicks",
                        "severity": "HIGH" if change_pct < -40 else "MEDIUM",
                        "details": f"Clicks: {prev_clicks} → {curr_clicks} ({change_pct:+.1f}%)",
                        "fix": "Check if content is outdated, competitors outranking, or Google algorithm changes affected rankings.",
                    })
    return issues


def analyze_missing_pages(gsc_data):
    """Key pages not appearing in search at all."""
    issues = []
    if not gsc_data:
        return issues

    indexed_pages = {
        extract_path(r["keys"][0]) for r in gsc_data["current"]["pages"]
    }

    for page in KEY_PAGES:
        if page not in indexed_pages:
            issues.append({
                "page": page,
                "issue": "Not appearing in search results",
                "severity": "HIGH",
                "details": "Zero impressions in the last 28 days",
                "fix": "Check indexing status, ensure page is in sitemap, add internal links to this page, submit for indexing.",
            })
    return issues


def analyze_high_bounce_pages(ga4_data):
    """Pages with high bounce rate → poor UX or content mismatch."""
    issues = []
    if not ga4_data:
        return issues

    for row in ga4_data["current"]["pages"]:
        page = row.get("pagePath", "")
        bounce_rate = float(row.get("bounceRate", 0)) * 100
        sessions = int(row.get("sessions", 0))

        if bounce_rate > THRESHOLDS["high_bounce_rate"] and sessions >= 10:
            issues.append({
                "page": page,
                "issue": "High bounce rate",
                "severity": "MEDIUM",
                "details": f"Bounce rate: {bounce_rate:.1f}%, Sessions: {sessions}",
                "fix": "Improve page load speed, ensure content matches search intent, add clear CTAs, improve above-fold content.",
            })
    return issues


def analyze_low_engagement(ga4_data):
    """Pages with low session duration → content not engaging."""
    issues = []
    if not ga4_data:
        return issues

    for row in ga4_data["current"]["pages"]:
        page = row.get("pagePath", "")
        avg_duration = float(row.get("averageSessionDuration", 0))
        sessions = int(row.get("sessions", 0))

        if avg_duration < THRESHOLDS["low_session_duration"] and sessions >= 10:
            issues.append({
                "page": page,
                "issue": "Very low session duration",
                "severity": "MEDIUM",
                "details": f"Avg duration: {avg_duration:.0f}s, Sessions: {sessions}",
                "fix": "Add more engaging content, images, internal links. Check if page content matches user intent.",
            })
    return issues


def analyze_keyword_opportunities(gsc_data):
    """Queries ranking 8-20 → push to top 5 with content optimization."""
    opportunities = []
    if not gsc_data:
        return opportunities

    for row in gsc_data["current"]["queries"]:
        query = row["keys"][0]
        position = row.get("position", 100)
        impressions = row.get("impressions", 0)

        if 8 <= position <= 20 and impressions >= THRESHOLDS["min_impressions"]:
            opportunities.append({
                "query": query,
                "position": position,
                "impressions": impressions,
                "clicks": row.get("clicks", 0),
                "ctr": row.get("ctr", 0) * 100,
            })

    opportunities.sort(key=lambda x: x["impressions"], reverse=True)
    return opportunities[:15]


def generate_report(issues, opportunities, gsc_data, ga4_data):
    """Generate markdown report for GitHub Issue."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Categorize issues by severity
    high = [i for i in issues if i["severity"] == "HIGH"]
    medium = [i for i in issues if i["severity"] == "MEDIUM"]

    # Summary stats
    total_clicks = 0
    total_impressions = 0
    if gsc_data and "current" in gsc_data:
        for row in gsc_data["current"]["pages"]:
            total_clicks += row.get("clicks", 0)
            total_impressions += row.get("impressions", 0)

    report = f"""# 🔍 SEO Agent Report — {SITE_NAME}
**Generated:** {now}
**Period:** {gsc_data['period']['start'] if gsc_data else 'N/A'} → {gsc_data['period']['end'] if gsc_data else 'N/A'}

---

## 📊 Overview
| Metric | Value |
|--------|-------|
| Total Clicks (GSC) | {total_clicks:,} |
| Total Impressions (GSC) | {total_impressions:,} |
| Avg CTR | {(total_clicks/total_impressions*100) if total_impressions > 0 else 0:.1f}% |
| Issues Found | 🔴 {len(high)} High, 🟡 {len(medium)} Medium |
| Keyword Opportunities | {len(opportunities)} |

---

## 🔴 High Priority Issues
"""

    if high:
        for i, issue in enumerate(high, 1):
            report += f"""
### {i}. {issue['issue']} — `{issue['page']}`
- **Details:** {issue['details']}
- **Suggested Fix:** {issue['fix']}
"""
    else:
        report += "\n✅ No high priority issues found!\n"

    report += "\n---\n\n## 🟡 Medium Priority Issues\n"

    if medium:
        for i, issue in enumerate(medium, 1):
            report += f"""
### {i}. {issue['issue']} — `{issue['page']}`
- **Details:** {issue['details']}
- **Suggested Fix:** {issue['fix']}
"""
    else:
        report += "\n✅ No medium priority issues found!\n"

    report += "\n---\n\n## 🚀 Keyword Opportunities (Rank 8-20)\n"
    report += "These queries are close to page 1 top spots — optimizing content could boost them:\n\n"

    if opportunities:
        report += "| Query | Position | Impressions | Clicks | CTR |\n"
        report += "|-------|----------|-------------|--------|-----|\n"
        for opp in opportunities:
            report += f"| {opp['query']} | {opp['position']:.1f} | {opp['impressions']:,} | {opp['clicks']:,} | {opp['ctr']:.1f}% |\n"
    else:
        report += "No keyword opportunities found in this period.\n"

    report += f"""
---

## ⚡ Action Required

**Aapko kya karna hai:**
1. Is report ko review karein
2. Agar fix chahiye to comment karein: **`fix karo`**
3. Claude Code automatically changes karega aur PR banayega
4. PR review karein, agar theek hai to comment karein: **`merge karo`**

> ⚠️ Koi bhi change bina aapki approval ke deploy nahi hoga.

---
*Generated by SEO Agent • [{SITE_NAME}]({SITE_URL})*
"""

    return report


def run_analysis():
    """Main analysis function."""
    print("🔍 Running SEO analysis...")

    gsc_data, ga4_data = load_data()

    if not gsc_data and not ga4_data:
        print("❌ No data found! Run fetch scripts first.")
        return None

    # Collect all issues
    all_issues = []
    all_issues.extend(analyze_low_ctr_pages(gsc_data))
    all_issues.extend(analyze_declining_pages(gsc_data))
    all_issues.extend(analyze_missing_pages(gsc_data))
    all_issues.extend(analyze_high_bounce_pages(ga4_data))
    all_issues.extend(analyze_low_engagement(ga4_data))

    # Get keyword opportunities
    opportunities = analyze_keyword_opportunities(gsc_data)

    print(f"   Found {len(all_issues)} issues, {len(opportunities)} keyword opportunities")

    # Generate report
    report = generate_report(all_issues, opportunities, gsc_data, ga4_data)

    # Save report
    os.makedirs("seo-agent/data", exist_ok=True)
    report_path = "seo-agent/data/report.md"
    with open(report_path, "w") as f:
        f.write(report)

    # Save issues as JSON (for Claude Code to consume)
    issues_path = "seo-agent/data/issues.json"
    with open(issues_path, "w") as f:
        json.dump({
            "issues": all_issues,
            "opportunities": opportunities,
            "generated_at": datetime.now().isoformat(),
        }, f, indent=2)

    print(f"✅ Report saved to {report_path}")
    print(f"✅ Issues saved to {issues_path}")

    return report


if __name__ == "__main__":
    run_analysis()
