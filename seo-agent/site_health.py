"""
Daily site health check — "site ka chowkidar".

Crawls the live site the way search and AI crawlers do and opens (or updates)
a single GitHub issue labelled `site-health` when something is broken. When
everything passes again, that issue is closed automatically. A healthy day
produces no issue and no email.

Why it exists: from 13 Aug to 7 Nov 2026 the homepage answered 404 to
Googlebot, Bingbot and ChatGPT while browsers saw a 200, and nobody noticed for
three months. Every check below is something that broke, or nearly broke,
during that period.

Usage:
    python seo-agent/site_health.py                # check + manage the alert issue
    python seo-agent/site_health.py --no-issue     # check only (weekly report uses this)
    python seo-agent/site_health.py --no-issue --strict   # CI: exit 1 on any problem
    HEALTH_BASE_URL=http://127.0.0.1:3000 DRY_RUN=1 python seo-agent/site_health.py
"""
import argparse
import json
import os
import re
import time
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

import requests

from config import (
    CRAWLER_USER_AGENTS,
    EXPECTED_PHONE,
    HEALTH_BASE_URL,
    RETIRED_PHONES,
    SITE_URL,
)

GOOGLEBOT = CRAWLER_USER_AGENTS["Googlebot"]
TIMEOUT = 25
WORKERS = 8
SITE_HOST = urlparse(SITE_URL).netloc
BASE_HOST = urlparse(HEALTH_BASE_URL).netloc
OUR_HOSTS = {SITE_HOST, f"www.{SITE_HOST}", BASE_HOST}
SKIP_PREFIXES = ("/_next/", "/api/", "/admin", "/uploads/", "/cdn-cgi/")
FILE_EXTENSION = re.compile(r"\.[a-z0-9]{2,5}$", re.I)
LABEL = "site-health"
DATA_PATH = "seo-agent/data/site_health.json"

# What each problem type means and what to do about it, in the owner's words.
# `level` decides the alert colour: critical = something customers or Google
# cannot reach right now; warning = worth fixing, not urgent.
PROBLEM_TYPES = {
    "crawler_home": ("critical", "Homepage crawlers ke liye nahi khul raha",
                     "Ye sabse serious masla hai: Google, Bing aur ChatGPT ko homepage nahi mil raha. Foran Claude ko is issue ka link bhejein."),
    "robots": ("critical", "robots.txt mein masla",
               "robots.txt Google ko site crawl karne se rok sakta hai. Claude ko is issue ka link bhejein."),
    "sitemap": ("critical", "Sitemap nahi khul raha",
                "Google ko naye pages sitemap se milte hain. Claude ko is issue ka link bhejein."),
    "page_error": ("critical", "Sitemap ke pages nahi khul rahe (404 / error)",
                   "Ye pages Google ko bataye gaye hain lekin khulte nahi. Agar admin panel mein koi gaadi, service ya blog delete/unpublish kiya hai to ye wajah ho sakti hai. Warna Claude ko link bhejein."),
    "page_redirect": ("warning", "Sitemap ke pages redirect ho rahe hain",
                      "Sitemap mein sirf asli pages hone chahiye, redirect wale nahi. Claude ko link bhejein."),
    "noindex": ("critical", "Aham pages Google se chhupe hue hain (noindex)",
                "Admin panel → SEO Manager mein in pages pe \"No index\" tick to nahi laga? Agar laga hai aur ghalti se hai to hata dein."),
    "canonical": ("warning", "Canonical tag ghalat ya ghayab",
                  "Admin panel → SEO Manager mein \"Canonical\" field khaali chhorein jab tak zaroorat na ho. Warna Claude ko link bhejein."),
    "title_h1": ("warning", "Page title ya main heading (H1) ghayab",
                 "Claude ko link bhejein."),
    "broken_link": ("critical", "Site ke andar toote links (404)",
                    "Kisi page pe aise link hain jo kahin nahi jaate. Neeche har link ke saath likha hai ke wo kis page pe hai. Agar wo admin panel ke content (service/blog text) mein hai to wahan theek kar dein."),
    "redirect_link": ("warning", "Site ke andar purane links (redirect pe jaate hain)",
                      "Ye links chalte hain lekin purane URL pe hain. Admin panel mein us page ke text mein link naye URL se badal dein (neeche dono URL likhe hain)."),
    "phone_missing": ("critical", f"Website pe business number (+{EXPECTED_PHONE}) nahi mila",
                      "Admin panel → Settings mein Phone aur WhatsApp number check karein. Agar number jaan boojh kar badla hai to Claude ko batayein taake check update ho."),
    "phone_retired": ("warning", "Purana phone number abhi bhi site pe hai",
                      "Ye pages purana number dikha rahe hain. Aksar ye admin panel ke content text mein likha hota hai — wahan badal dein."),
    "retired_redirect": ("critical", "Purani gaadiyon ke redirects kaam nahi kar rahe",
                         "Purane URL (Google ke index mein) ab sahi jagah nahi jaate. Claude ko is issue ka link bhejein."),
    "hreflang": ("warning", "Language links (hreflang) ghalat",
                 "Translated pages ke aapas ke links mein ghalti hai (jaise /ar/ slash ke saath). Claude ko link bhejein."),
    "hreflang_header": ("warning", "Server header mein extra language links",
                        "Website har page ke saath 6 languages ka header bhej rahi hai jo page ke andar ke links se takrata hai. Claude ko link bhejein."),
    "www": ("warning", "www wala address sahi redirect nahi ho raha",
            "Vercel → Project → Settings → Domains mein www ko apexchauffeurdubai.com pe redirect karein."),
}


class PageParser(HTMLParser):
    """Just the bits of a page the checks need — no third-party parser."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.canonical = None
        self.robots = []
        self.title = ""
        self.h1_count = 0
        self.links = []
        self.hreflangs = []
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        rel = a.get("rel", "").lower().split()
        if tag == "link" and "canonical" in rel:
            self.canonical = a.get("href")
        elif tag == "link" and "alternate" in rel and a.get("hreflang"):
            self.hreflangs.append(a.get("href", ""))
        elif tag == "meta" and a.get("name", "").lower() in ("robots", "googlebot"):
            self.robots.append(a.get("content", "").lower())
        elif tag == "title" and not self.title:
            self._in_title = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def phone_pattern(digits):
    """Matches the number with or without +, spaces, dashes or a leading 0."""
    local = digits[3:] if digits.startswith("971") else digits
    sep = r"[\s\-]?"
    body = sep.join(local)
    return re.compile(rf"(?:\+?971{sep}|0){body}")


def fetch(url, user_agent=GOOGLEBOT):
    """GET without following redirects. One retry on network errors and 5xx."""
    last_error = None
    for attempt in range(2):
        try:
            r = requests.get(url, headers={"User-Agent": user_agent}, allow_redirects=False, timeout=TIMEOUT)
            if r.status_code >= 500 and attempt == 0:
                time.sleep(3)
                continue
            return r.status_code, r.headers.get("location", ""), r.text if r.status_code == 200 else ""
        except requests.RequestException as error:
            last_error = error
            time.sleep(3)
    return None, "", f"{type(last_error).__name__}"


def to_path(url):
    parsed = urlparse(url)
    path = parsed.path or "/"
    return path.rstrip("/") if path != "/" else "/"


class Findings:
    def __init__(self):
        self.items = {}

    def add(self, kind, item):
        self.items.setdefault(kind, [])
        if item not in self.items[kind]:
            self.items[kind].append(item)

    def keys(self):
        return sorted(f"{kind}|{item}" for kind, items in self.items.items() for item in items)

    def level(self):
        levels = {PROBLEM_TYPES[k][0] for k in self.items}
        return "critical" if "critical" in levels else ("warning" if levels else "ok")


def check_crawlers(findings):
    for name, ua in CRAWLER_USER_AGENTS.items():
        status, location, _ = fetch(f"{HEALTH_BASE_URL}/", ua)
        if status != 200:
            detail = f"{status}" + (f" → {location}" if location else "") if status else "jawab nahi mila"
            findings.add("crawler_home", f"{name}: {detail}")


def check_robots(findings):
    status, _, text = fetch(f"{HEALTH_BASE_URL}/robots.txt")
    if status != 200:
        findings.add("robots", f"robots.txt ka jawab: {status}")
        return
    if re.search(r"(?im)^\s*disallow:\s*/\s*$", text):
        findings.add("robots", "robots.txt mein \"Disallow: /\" hai — poori site block")
    if "sitemap:" not in text.lower():
        findings.add("robots", "robots.txt mein sitemap ka link nahi")


def load_sitemap(findings):
    status, _, text = fetch(f"{HEALTH_BASE_URL}/sitemap.xml")
    if status != 200:
        findings.add("sitemap", f"sitemap.xml ka jawab: {status}")
        return []
    try:
        root = ET.fromstring(text)
    except ET.ParseError as error:
        findings.add("sitemap", f"sitemap.xml parse nahi hua: {error}")
        return []
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    paths = sorted({to_path(loc.text.strip()) for loc in root.findall(".//sm:url/sm:loc", ns) if loc.text})
    if not paths:
        findings.add("sitemap", "sitemap.xml khaali hai")
    return paths


def check_page(path):
    status, location, html = fetch(f"{HEALTH_BASE_URL}{path}")
    result = {"path": path, "status": status, "location": location, "links": [], "problems": []}
    if status != 200:
        if status in (301, 302, 307, 308):
            result["problems"].append(("page_redirect", f"{path} → {to_path(location)}"))
        else:
            result["problems"].append(("page_error", f"{path} ({status or html})"))
        return result

    page = PageParser()
    page.feed(html)
    result["links"] = page.links

    if any("noindex" in r for r in page.robots):
        result["problems"].append(("noindex", path))
    if not page.canonical:
        result["problems"].append(("canonical", f"{path}: canonical nahi hai"))
    else:
        c = urlparse(page.canonical)
        if c.netloc != SITE_HOST or to_path(page.canonical) != path or (c.path.endswith("/") and c.path != "/"):
            result["problems"].append(("canonical", f"{path}: canonical {page.canonical}"))
    for href in page.hreflangs:
        h = urlparse(href)
        if h.netloc != SITE_HOST or (h.path not in ("", "/") and h.path.endswith("/")):
            result["problems"].append(("hreflang", f"{path}: {href}"))
            break
    if not page.title.strip():
        result["problems"].append(("title_h1", f"{path}: title nahi"))
    if page.h1_count == 0:
        result["problems"].append(("title_h1", f"{path}: H1 nahi"))

    result["has_phone"] = bool(phone_pattern(EXPECTED_PHONE).search(html))
    result["retired_phone"] = any(phone_pattern(p).search(html) for p in RETIRED_PHONES)
    return result


def internal_link_targets(page_results, sitemap_paths):
    """Internal link path → pages that contain it, minus what the sitemap pass already checked."""
    checked = set(sitemap_paths)
    targets = {}
    for result in page_results:
        page_url = f"{HEALTH_BASE_URL}{result['path']}"
        for href in result["links"]:
            if href.startswith(("mailto:", "tel:", "#", "javascript:", "sms:")):
                continue
            absolute = urljoin(page_url, href)
            parsed = urlparse(absolute)
            if parsed.scheme not in ("http", "https") or parsed.netloc not in OUR_HOSTS:
                continue
            path = to_path(absolute)
            if path.startswith(SKIP_PREFIXES) or FILE_EXTENSION.search(path) or path in checked:
                continue
            targets.setdefault(path, set()).add(result["path"])
    return targets


def check_link(path):
    status, location, detail = fetch(f"{HEALTH_BASE_URL}{path}")
    return path, status, location, detail


def retired_redirects():
    """(from, to) pairs from lib/retired-slugs.ts — the same list next.config.ts redirects."""
    source = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib", "retired-slugs.ts")
    try:
        with open(source) as f:
            text = f.read()
    except OSError:
        return []
    return re.findall(r'\["([a-z0-9-]+)",\s*"([a-z0-9-]+)"\]', text)


def check_retired_redirects(findings):
    """Every retired vehicle slug must 301/308 to its target, unprefixed and prefixed."""
    for old, new in retired_redirects():
        for prefix in ("", "/ar"):
            status, location, _ = fetch(f"{HEALTH_BASE_URL}{prefix}/fleet/{old}")
            if status not in (301, 308) or to_path(location) != f"{prefix}/fleet/{new}":
                findings.add("retired_redirect", f"{prefix}/fleet/{old} → {status} {to_path(location) if location else ''}".strip())


def check_link_header(findings):
    """next-intl's `alternateLinks` must stay off: an HTTP Link header listing all
    six locales contradicts the narrowed hreflang in the HTML (fixed Nov 2026)."""
    try:
        r = requests.get(f"{HEALTH_BASE_URL}/fleet", headers={"User-Agent": GOOGLEBOT}, allow_redirects=False, timeout=TIMEOUT)
    except requests.RequestException:
        return
    if "hreflang" in r.headers.get("link", "").lower():
        findings.add("hreflang_header", "/fleet response mein `Link: …hreflang` header")


def check_www(findings):
    if HEALTH_BASE_URL != SITE_URL.rstrip("/"):
        return  # only meaningful against the production domain
    status, location, _ = fetch(f"https://www.{SITE_HOST}/")
    if status not in (301, 308) or urlparse(location).netloc != SITE_HOST:
        findings.add("www", f"https://www.{SITE_HOST}/ → {status} {location}".strip())


def run_checks():
    findings = Findings()
    check_crawlers(findings)
    check_robots(findings)
    check_www(findings)
    check_retired_redirects(findings)
    check_link_header(findings)
    sitemap_paths = load_sitemap(findings)

    with ThreadPoolExecutor(WORKERS) as pool:
        page_results = list(pool.map(check_page, sitemap_paths))

    for result in page_results:
        for kind, item in result["problems"]:
            findings.add(kind, item)

    home = next((r for r in page_results if r["path"] == "/" and r["status"] == 200), None)
    if home and not home.get("has_phone"):
        findings.add("phone_missing", "Homepage")
    for result in page_results:
        if result.get("retired_phone"):
            findings.add("phone_retired", result["path"])

    targets = internal_link_targets(page_results, sitemap_paths)
    with ThreadPoolExecutor(WORKERS) as pool:
        link_results = list(pool.map(check_link, sorted(targets)))
    for path, status, location, detail in link_results:
        sources = sorted(targets[path])
        where = ", ".join(sources[:3]) + (f" (+{len(sources) - 3} aur)" if len(sources) > 3 else "")
        if status in (301, 302, 307, 308):
            findings.add("redirect_link", f"{path} → {to_path(location)} — in pages pe: {where}")
        elif status != 200:
            findings.add("broken_link", f"{path} ({status or detail}) — in pages pe: {where}")

    return findings, {
        "checked_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "base_url": HEALTH_BASE_URL,
        "pages_checked": len(page_results),
        "links_checked": len(link_results),
        "level": findings.level(),
        "problems": {
            kind: {"level": PROBLEM_TYPES[kind][0], "title": PROBLEM_TYPES[kind][1], "items": items}
            for kind, items in findings.items.items()
        },
        "keys": findings.keys(),
    }


def render(summary):
    """Issue body in Roman Urdu, critical problems first."""
    icon = "🔴" if summary["level"] == "critical" else "🟡"
    lines = [
        f"## {icon} Site Alert",
        f"**Check:** {summary['checked_at']} · sitemap ke {summary['pages_checked']} pages · un pe mile {summary['links_checked']} doosre links",
        "",
        "Rozana ke automatic check mein ye masle mile:",
        "",
    ]
    ordered = sorted(summary["problems"].items(), key=lambda kv: (kv[1]["level"] != "critical", kv[0]))
    for kind, problem in ordered:
        mark = "🔴" if problem["level"] == "critical" else "🟡"
        items = problem["items"]
        lines.append(f"### {mark} {problem['title']} ({len(items)})")
        for item in items[:25]:
            lines.append(f"- `{item}`" if " — " not in item else f"- {item}")
        if len(items) > 25:
            lines.append(f"- … aur {len(items) - 25}")
        lines.append(f"\n**Kya karein:** {PROBLEM_TYPES[kind][2]}\n")
    lines += [
        "---",
        "Ye alert **khud band ho jayega** jab saare masle theek ho jayenge. Naya masla aaya to isi issue pe comment aayega.",
        f"<!-- health-keys: {json.dumps(summary['keys'])} -->",
    ]
    return "\n".join(lines)


def previous_keys(body):
    match = re.search(r"<!-- health-keys: (.*?) -->", body or "", re.S)
    try:
        return set(json.loads(match.group(1))) if match else set()
    except json.JSONDecodeError:
        return set()


def manage_issue(summary):
    import github_api

    open_issues = github_api.list_open_issues(LABEL)
    current = open_issues[0] if open_issues else None
    for extra in open_issues[1:]:  # never leave duplicates around
        github_api.close_issue(extra["number"], f"#{current['number']} mein shamil kar diya.")

    if summary["level"] == "ok":
        if current:
            github_api.close_issue(current["number"], "✅ Aaj ke check mein sab theek hai — ye alert khud band ho raha hai.")
        print("✅ Site healthy — no alert.")
        return

    icon = "🔴" if summary["level"] == "critical" else "🟡"
    count = sum(len(p["items"]) for p in summary["problems"].values())
    title = f"{icon} Site Alert — {count} masle mile"
    body = render(summary)

    if not current:
        github_api.create_issue(title, body, [LABEL, "automated"])
        return

    github_api.update_issue(current["number"], title=title, body=body)
    new = set(summary["keys"]) - previous_keys(current.get("body"))
    if new:
        listed = "\n".join(f"- {k.split('|', 1)[1]}" for k in sorted(new)[:15])
        github_api.comment(current["number"], f"⚠️ **Naye masle mile ({len(new)}):**\n{listed}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-issue", action="store_true", help="check only; do not open or close the alert issue")
    parser.add_argument("--strict", action="store_true", help="exit 1 when any problem is found (CI gate)")
    args = parser.parse_args()

    findings, summary = run_checks()
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
    with open(DATA_PATH, "w") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"Checked {summary['pages_checked']} pages and {summary['links_checked']} links — status: {summary['level']}")
    for kind, problem in summary["problems"].items():
        print(f"  [{problem['level']}] {problem['title']}: {len(problem['items'])}")

    step_summary = os.getenv("GITHUB_STEP_SUMMARY")
    if step_summary:
        with open(step_summary, "a") as f:
            f.write(render(summary) if summary["level"] != "ok" else "## ✅ Site health: sab theek\n")

    if not args.no_issue:
        manage_issue(summary)

    if args.strict and summary["level"] != "ok":
        for kind, problem in summary["problems"].items():
            for item in problem["items"][:10]:
                print(f"::error title={problem['title']}::{item}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
