#!/usr/bin/env python3
"""
Renders the WhatsApp AI agent knowledge base to a print-ready PDF.

    python3 knowledge-base/build-pdf.py

Reads whatsapp-ai-agent-knowledge-base.md, converts it to styled HTML
(brand black/gold, A4, repeating table headers), and prints it with
headless Chromium. Only the Markdown subset the generator emits is
supported — headings, tables, lists, blockquotes, rules, bold/italic/code
and links — which is all this document uses.

Chromium is looked up in CHROME_PATH, then the usual install locations.
Run knowledge-base/generate-whatsapp-kb.mjs first if the content changed.
"""
import html
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "whatsapp-ai-agent-knowledge-base.md"
DST = HERE / "whatsapp-ai-agent-knowledge-base.pdf"

CHROME_CANDIDATES = [
    os.environ.get("CHROME_PATH", ""),
    "/opt/pw-browsers/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]

CSS = """
@page { size: A4; margin: 18mm 15mm 16mm 15mm; }
* { box-sizing: border-box; }
body { font-family: "DejaVu Sans", "Liberation Sans", Arial, sans-serif; font-size: 10.2pt;
       line-height: 1.55; color: #14140F; margin: 0; }
h1 { font-size: 24pt; color: #0B0B0B; border-bottom: 3px solid #D4AF37; padding-bottom: 8px;
     margin: 0 0 6px; line-height: 1.2; }
h2 { font-size: 15pt; background: #0B0B0B; color: #fff; padding: 7px 10px;
     border-left: 5px solid #D4AF37; margin: 26px 0 10px; page-break-after: avoid; }
h3 { font-size: 12.5pt; color: #0B0B0B; margin: 18px 0 6px; padding-bottom: 3px;
     border-bottom: 1px solid #E2DDCE; page-break-after: avoid; }
h4 { font-size: 10.6pt; color: #6B5A16; margin: 12px 0 2px; page-break-after: avoid; }
h5, h6 { font-size: 10pt; color: #6B5A16; margin: 10px 0 2px; page-break-after: avoid; }
p { margin: 0 0 7px; orphans: 2; widows: 2; }
ul, ol { margin: 0 0 9px; padding-left: 20px; }
li { margin: 0 0 3px; }
strong { color: #0B0B0B; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 9pt; background: #F4F1E8;
       padding: 1px 4px; border-radius: 3px; }
a { color: #6B5A16; text-decoration: none; word-break: break-word; }
blockquote { margin: 6px 0 10px; padding: 8px 12px; background: #FBF9F3;
             border-left: 3px solid #D4AF37; font-style: italic; page-break-inside: avoid; }
hr { border: 0; border-top: 1px solid #E2DDCE; margin: 18px 0; }
table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; font-size: 8.4pt; }
th { background: #0B0B0B; color: #fff; text-align: left; padding: 6px 7px; font-weight: 600; }
td { border-bottom: 1px solid #E2DDCE; padding: 5px 7px; vertical-align: top; }
tr:nth-child(even) td { background: #FBF9F3; }
thead { display: table-header-group; }
"""


def inline(text: str) -> str:
    """Inline Markdown → HTML. Escapes first, so content can't inject tags."""
    t = html.escape(text)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", t)
    t = re.sub(r"_([^_\n]+)_", r"<em>\1</em>", t)
    t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', t)
    t = re.sub(r'(?<![">=])\b(https?://[^\s<)\]]+)', r'<a href="\1">\1</a>', t)
    return t


def to_html(md: str) -> str:
    lines = md.split("\n")
    out: list[str] = []
    i = 0
    list_tag: str | None = None

    def close_list() -> None:
        nonlocal list_tag
        if list_tag:
            out.append(f"</{list_tag}>")
            list_tag = None

    while i < len(lines):
        stripped = lines[i].strip()

        if not stripped:
            close_list()
            i += 1
            continue

        # Table: header row followed by a |---|---| separator.
        if stripped.startswith("|") and i + 1 < len(lines) and re.match(
            r"^\|[\s:\-|]+\|$", lines[i + 1].strip()
        ):
            close_list()
            head = [c.strip() for c in stripped.strip("|").split("|")]
            out.append(
                "<table><thead><tr>"
                + "".join(f"<th>{inline(c)}</th>" for c in head)
                + "</tr></thead><tbody>"
            )
            i += 2
            while i < len(lines) and lines[i].strip().startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in cells) + "</tr>")
                i += 1
            out.append("</tbody></table>")
            continue

        heading = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if heading:
            close_list()
            level = len(heading.group(1))
            out.append(f"<h{level}>{inline(heading.group(2))}</h{level}>")
            i += 1
            continue

        if stripped == "---":
            close_list()
            out.append("<hr>")
            i += 1
            continue

        if stripped.startswith(">"):
            close_list()
            quoted = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quoted.append(lines[i].strip().lstrip(">").strip())
                i += 1
            out.append("<blockquote>" + "<br>".join(inline(q) for q in quoted) + "</blockquote>")
            continue

        bullet = re.match(r"^-\s+(.*)$", stripped)
        if bullet:
            if list_tag != "ul":
                close_list()
                out.append("<ul>")
                list_tag = "ul"
            out.append(f"<li>{inline(bullet.group(1))}</li>")
            i += 1
            continue

        numbered = re.match(r"^\d+\.\s+(.*)$", stripped)
        if numbered:
            if list_tag != "ol":
                close_list()
                out.append("<ol>")
                list_tag = "ol"
            out.append(f"<li>{inline(numbered.group(1))}</li>")
            i += 1
            continue

        close_list()
        out.append(f"<p>{inline(stripped)}</p>")
        i += 1

    close_list()
    return (
        '<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8">\n'
        "<title>Apex Limo &amp; Chauffeur Dubai — WhatsApp AI Agent Knowledge Base</title>\n"
        f"<style>{CSS}</style></head><body>\n" + "\n".join(out) + "\n</body></html>"
    )


def find_chrome() -> str:
    for candidate in CHROME_CANDIDATES:
        if candidate and (os.path.exists(candidate) or shutil.which(candidate)):
            return candidate
    sys.exit(
        "Chromium/Chrome not found. Install it, or set CHROME_PATH to the binary."
    )


def main() -> None:
    if not SRC.exists():
        sys.exit(f"{SRC} missing — run: node knowledge-base/generate-whatsapp-kb.mjs")

    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "kb.html"
        page.write_text(to_html(SRC.read_text(encoding="utf-8")), encoding="utf-8")
        subprocess.run(
            [
                find_chrome(),
                "--headless",
                "--no-sandbox",
                "--disable-gpu",
                "--run-all-compositor-stages-before-draw",
                "--virtual-time-budget=20000",
                "--no-pdf-header-footer",
                f"--print-to-pdf={DST}",
                page.as_uri(),
            ],
            check=True,
            capture_output=True,
        )

    print(f"Wrote {DST} ({DST.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
