"""
Analyze GSC + GA4 data and generate SEO report.
Identifies issues and suggests fixes.
"""
import json
import os
import re
from datetime import datetime
from config import SITE_URL, SITE_NAME, THRESHOLDS


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


STATE_MARKER = "seo-state"

COVERAGE_URDU = {
    "Submitted and indexed": "Indexed",
    "Indexed, not submitted in sitemap": "Indexed (sitemap se bahar)",
    "Crawled - currently not indexed": "Crawl hua, index nahi",
    "Discovered - currently not indexed": "Mila, abhi crawl nahi hua",
    "Page with redirect": "Redirect",
    "Duplicate, Google chose different canonical than user": "Google ne doosra page chuna",
    "Alternate page with proper canonical tag": "Doosre page ka alternate",
    "URL is unknown to Google": "Google ko abhi pata nahi",
    "Excluded by ‘noindex’ tag": "noindex laga hai",
    "Not found (404)": "404",
}

SOURCE_BUCKETS = [
    ("Google", ("google",)),
    ("Bing", ("bing",)),
    ("ChatGPT", ("chatgpt", "openai")),
    ("Doosre AI (Perplexity, Copilot, Gemini…)", ("perplexity", "copilot", "gemini", "claude", "deepseek")),
    ("Direct (seedha link / bookmark)", ("(direct)",)),
    ("Social (Instagram, Facebook…)", ("instagram", "facebook", "fb", "t.co", "twitter", "linkedin", "tiktok", "youtube", "whatsapp")),
]


def load_json(path):
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return None


def change(prev, curr):
    """'+12%' style difference, or a plain arrow when the base is too small to mean much."""
    if prev in (None, 0):
        return "naya" if curr else "—"
    pct = (curr - prev) / prev * 100
    arrow = "⬆️" if pct > 0 else ("⬇️" if pct < 0 else "➖")
    return f"{arrow} {pct:+.0f}%"


def bucket_sources(rows):
    totals = {name: 0 for name, _ in SOURCE_BUCKETS}
    totals["Baqi"] = 0
    for row in rows or []:
        source = row.get("sessionSource", "").lower()
        sessions = int(row.get("sessions", 0))
        for name, needles in SOURCE_BUCKETS:
            if any(n in source for n in needles):
                totals[name] += sessions
                break
        else:
            totals["Baqi"] += sessions
    return totals


def previous_state():
    """State block embedded in the last weekly report, for week-on-week index changes."""
    try:
        import github_api
        issue = github_api.latest_issue("seo-report")
    except Exception:  # noqa: BLE001 — first run, no token, or API hiccup
        return {}
    body = (issue or {}).get("body") or ""
    match = re.search(rf"<!-- {STATE_MARKER}: (.*?) -->", body, re.S)
    try:
        return json.loads(match.group(1)) if match else {}
    except json.JSONDecodeError:
        return {}


def build_report(gsc, ga4, index, health, prev_state, opportunities, low_ctr, bounce):
    today = datetime.now().strftime("%d %b %Y")
    alerts, actions = [], []

    # ── Health ──
    health_level = (health or {}).get("level", "unknown")
    if health_level == "critical":
        alerts.append("🔴")
        actions.append("**Site Alert** issue khula hai — us ka link Claude ko bhejein.")
    elif health_level == "warning":
        alerts.append("🟡")
        actions.append("Site Alert issue mein chhote masle hain — fursat mein dekh lein.")

    # ── Data availability ──
    for name, data in (("Search Console", gsc), ("Google Analytics", ga4), ("Index check", index)):
        if not data or data.get("error"):
            alerts.append("🟡")
            actions.append(f"{name} ka data nahi mila ({(data or {}).get('error', 'file nahi bani')[:120]}). Claude ko batayein.")

    # ── Search totals ──
    totals = (gsc or {}).get("totals") or {}
    week, prev_week = totals.get("week") or {}, totals.get("prev_week") or {}
    clicks, prev_clicks = week.get("clicks", 0), prev_week.get("clicks", 0)
    if prev_clicks >= 10 and clicks < prev_clicks * 0.7:
        alerts.append("🟡")
        actions.append(f"Google clicks {prev_clicks} se {clicks} pe aa gaye (30% se zyada kami). Claude ko report ka link bhejein.")

    # ── Index status ──
    pages = (index or {}).get("pages") or []
    indexed_now = {p["path"] for p in pages if p.get("verdict") == "PASS"}
    indexed_before = set(prev_state.get("indexed", []))
    newly_indexed = [p["path"] for p in pages if p["path"] in indexed_now and p["path"] not in indexed_before] if indexed_before else []
    dropped = [p["path"] for p in pages if p["path"] in indexed_before and p["path"] not in indexed_now and not p.get("error")]
    if "/" in {p["path"] for p in pages} and "/" not in indexed_now and not any(p.get("error") for p in pages if p["path"] == "/"):
        alerts.append("🔴")
        actions.append("**Homepage Google index mein nahi hai.** Foran Claude ko batayein.")
    if dropped:
        alerts.append("🟡")
        actions.append(f"{len(dropped)} aham page(s) Google index se nikle: {', '.join(dropped[:5])}. Claude ko batayein.")

    # ── Leads ──
    weekly = (ga4 or {}).get("weekly") or {}
    leads = ((weekly.get("week") or {}).get("leads") or {})
    prev_leads = ((weekly.get("prev_week") or {}).get("leads") or {})
    if prev_leads.get("total", 0) >= 3 and leads.get("total", 0) == 0:
        alerts.append("🟡")
        actions.append("Is hafte website se **ek bhi enquiry click** record nahi hua. Ek test booking bhej kar check karein.")

    status = "🔴" if "🔴" in alerts else ("🟡" if alerts else "🟢")
    headline = {
        "🟢": "Is hafte sab theek hai",
        "🟡": "Kuch cheezen dekhne wali hain",
        "🔴": "Foran tawajjuh chahiye",
    }[status]

    out = [
        f"# {status} Weekly SEO Report — {today}",
        (f"**Google data:** {week['start']} → {week['end']} (Search Console ~3 din peeche chalta hai)" if week else "**Google data:** is hafte nahi mila"),
        "",
        f"> ### {status} {headline}",
        "> 👉 **Aap ko kya karna hai:** " + ("Kuch nahi." if not actions else ""),
    ]
    for a in actions:
        out.append(f"> - {a}")

    # Google search
    out += ["", "## 📈 Google Search — is hafta vs pichla hafta", "| | Pichla hafta | Is hafta | Farq |", "|---|---:|---:|---|"]
    if week:
        out.append(f"| Clicks | {prev_clicks:,} | {clicks:,} | {change(prev_clicks, clicks)} |")
        out.append(f"| Impressions | {prev_week.get('impressions', 0):,} | {week.get('impressions', 0):,} | {change(prev_week.get('impressions', 0), week.get('impressions', 0))} |")
        out.append(f"| CTR | {prev_week.get('ctr', 0) * 100:.1f}% | {week.get('ctr', 0) * 100:.1f}% | |")
        out.append(f"| Average position | {prev_week.get('position', 0):.1f} | {week.get('position', 0):.1f} | (kam = behtar) |")
        d28, p28 = totals.get("days28") or {}, totals.get("prev_days28") or {}
        out.append(f"\n**Pichle 28 din:** {d28.get('clicks', 0):,} clicks · {d28.get('impressions', 0):,} impressions (us se pehle 28 din: {p28.get('clicks', 0):,} clicks · {p28.get('impressions', 0):,} impressions)")
    else:
        out.append("| — | | | Data nahi mila |")

    # GA4
    out += ["", "## 👥 Visitors aur enquiries (Google Analytics)"]
    if weekly:
        now_src = bucket_sources((weekly.get("week") or {}).get("sources"))
        prev_src = bucket_sources((weekly.get("prev_week") or {}).get("sources"))
        out += ["| Kahan se aaye | Pichla hafta | Is hafta |", "|---|---:|---:|"]
        for name in now_src:
            if now_src[name] or prev_src[name]:
                out.append(f"| {name} | {prev_src[name]} | {now_src[name]} |")
        out.append(f"| **Total visits** | **{sum(prev_src.values())}** | **{sum(now_src.values())}** |")
        channel_names = {"whatsapp": "WhatsApp", "phone": "Call", "booking": "Booking form", "quote": "Quote form", "contact": "Contact form"}
        split = ", ".join(f"{channel_names.get(k, k)} {v}" for k, v in sorted((leads.get("by_channel") or {}).items(), key=lambda kv: -kv[1]))
        out.append(
            f"\n**Enquiry clicks** (WhatsApp, call, forms): pichla hafta **{prev_leads.get('total', 0)}** → is hafta **{leads.get('total', 0)}**"
            + (f" ({split})" if split else "")
        )
        out.append("<sub>Sirf un visitors ke clicks gine jaate hain jinhon ne cookie consent diya — asal enquiries is se zyada ho sakti hain.</sub>")
    else:
        out.append("Data nahi mila.")

    # Index status
    out += ["", f"## 📑 Aham pages Google index mein — {len(indexed_now)}/{len(pages)} ✅" if pages else "## 📑 Aham pages Google index mein"]
    if pages:
        if newly_indexed:
            out.append(f"✅ **Naye index hue:** {', '.join(f'`{p}`' for p in newly_indexed)}")
        if dropped:
            out.append(f"❌ **Index se nikle:** {', '.join(f'`{p}`' for p in dropped)}")
        not_indexed = [p for p in pages if p.get("verdict") != "PASS"]
        if not_indexed:
            out.append("\n**Abhi index nahi:**")
            for p in not_indexed:
                reason = COVERAGE_URDU.get(p.get("coverage"), p.get("coverage") or p.get("error", "")[:80])
                out.append(f"- `{p['path']}` — {reason}")
        out += ["", "<details><summary>Saare pages ki list</summary>", "", "| Page | Status | Aakhri crawl |", "|---|---|---|"]
        for p in pages:
            mark = "✅" if p.get("verdict") == "PASS" else "❌"
            crawl = (p.get("last_crawl") or "")[:10] or "—"
            reason = COVERAGE_URDU.get(p.get("coverage"), p.get("coverage") or p.get("error", "")[:60])
            out.append(f"| `{p['path']}` | {mark} {reason} | {crawl} |")
        out += ["", "</details>"]
    else:
        out.append("Is hafte index check nahi ho saka.")

    # Queries
    queries = sorted(((gsc or {}).get("current") or {}).get("queries") or [], key=lambda r: (-r.get("clicks", 0), -r.get("impressions", 0)))[:10]
    out += ["", "## 🔍 Log Google pe kya search karke aaye (pichle 28 din, top 10)"]
    if queries:
        out += ["| Search | Clicks | Impressions | Position |", "|---|---:|---:|---:|"]
        for r in queries:
            out.append(f"| {r['keys'][0]} | {r.get('clicks', 0)} | {r.get('impressions', 0)} | {r.get('position', 0):.1f} |")
    else:
        out.append("Data nahi mila.")

    # Health
    out += ["", "## 🛡️ Site health"]
    if health:
        if health_level == "ok":
            out.append(f"🟢 Sab theek — sitemap ke {health['pages_checked']} pages aur un ke saare internal links check hue, koi masla nahi.")
        else:
            out.append(f"{'🔴' if health_level == 'critical' else '🟡'} Masle mile — tafseel **Site Alert** issue mein:")
            for problem in (health.get("problems") or {}).values():
                out.append(f"- {problem['title']} ({len(problem['items'])})")
    else:
        out.append("Check nahi chal saka.")

    # Suggestions — optional, capped
    tips = []
    for o in opportunities[:3]:
        tips.append(f"\"{o['query']}\" Google pe position {o['position']:.0f} pe hai ({o['impressions']} impressions) — thodi mehnat se pehle page pe aa sakta hai.")
    for i in low_ctr[:2]:
        tips.append(f"`{i['page']}` achhi position pe hai lekin log kam click karte hain ({i['details']}) — title/description behtar ho sakta hai.")
    for i in bounce[:1]:
        tips.append(f"`{i['page']}` pe zyada log foran wapas chale jaate hain ({i['details']}).")
    if tips:
        out += ["", "## 💡 Mashware (zaroori nahi, jab waqt ho)"] + [f"- {t}" for t in tips]
        out.append("\nIn mein se kuch karwana ho to is issue pe comment karein: **`fix karo`**")

    state = {"date": datetime.now().strftime("%Y-%m-%d"), "indexed": sorted(indexed_now) if pages else prev_state.get("indexed", []), "week_clicks": clicks}
    out += [
        "",
        "---",
        f"*Har Monday automatic · Rozana site check alag se chalta hai aur masla ho to hi alert banata hai · [{SITE_NAME}]({SITE_URL})*",
        f"<!-- {STATE_MARKER}: {json.dumps(state)} -->",
    ]
    return f"{status} Weekly SEO Report — {today}", "\n".join(out)


def run_analysis():
    """Build the weekly report from whatever data the fetch steps produced."""
    print("🔍 Building weekly report...")
    gsc = load_json("seo-agent/data/gsc_data.json")
    ga4 = load_json("seo-agent/data/ga4_data.json")
    index = load_json("seo-agent/data/index_status.json")
    health = load_json("seo-agent/data/site_health.json")

    ok_gsc = gsc if gsc and not gsc.get("error") else None
    ok_ga4 = ga4 if ga4 and not ga4.get("error") else None
    opportunities = analyze_keyword_opportunities(ok_gsc) if ok_gsc else []
    low_ctr = (analyze_low_ctr_pages(ok_gsc) or []) if ok_gsc else []
    bounce = sorted(analyze_high_bounce_pages(ok_ga4), key=lambda i: -int(re.search(r"Sessions: (\d+)", i["details"]).group(1))) if ok_ga4 else []

    title, report = build_report(gsc, ga4, index, health, previous_state(), opportunities, low_ctr, bounce)

    os.makedirs("seo-agent/data", exist_ok=True)
    with open("seo-agent/data/report.md", "w") as f:
        f.write(report)
    with open("seo-agent/data/report_meta.json", "w") as f:
        json.dump({"title": title}, f, ensure_ascii=False)
    print(f"✅ {title}")
    return report


if __name__ == "__main__":
    run_analysis()
