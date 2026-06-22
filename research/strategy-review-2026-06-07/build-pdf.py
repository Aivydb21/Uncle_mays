# -*- coding: utf-8 -*-
"""Convert the strategy review markdown to a styled, print-ready HTML for PDF rendering."""
import markdown, os, re

DIR = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(DIR, "strategy-review-2026-06-07.md")
HTML = os.path.join(DIR, "strategy-review-2026-06-07.html")

md_text = open(SRC, encoding="utf-8").read()

# Insert a board-level Table of Contents after the title block (before the first --- divider).
divider = "\n---\n"
idx = md_text.find(divider)
if idx != -1:
    head = md_text[:idx]
    body = md_text[idx:]
    md_text = head + "\n\n## Contents\n\n[TOC]\n" + body

html_body = markdown.markdown(
    md_text,
    extensions=["tables", "fenced_code", "sane_lists", "attr_list", "toc"],
    extension_configs={"toc": {"toc_depth": "2-2", "title": None}},
)

CSS = """
@page { size: Letter; margin: 0.85in 0.8in; }
* { box-sizing: border-box; }
body {
  font-family: "Segoe UI", Calibri, Arial, sans-serif;
  font-size: 10.5pt; line-height: 1.5; color: #1a1a1a; max-width: 100%;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
h1 {
  font-size: 21pt; color: #1f5132; border-bottom: 3px solid #2f7d4f;
  padding-bottom: 6px; margin: 0 0 14px; page-break-before: always; page-break-after: avoid;
}
h1:first-of-type { page-break-before: avoid; }
h2 {
  font-size: 15pt; color: #1f5132; margin: 22px 0 8px;
  border-bottom: 1px solid #cfe3d6; padding-bottom: 3px; page-break-after: avoid;
}
h3 { font-size: 12pt; color: #2a2a2a; margin: 16px 0 6px; page-break-after: avoid; }
h4 { font-size: 10.5pt; color: #444; margin: 12px 0 4px; text-transform: uppercase; letter-spacing: .03em; page-break-after: avoid; }
p { margin: 6px 0; }
ul, ol { margin: 6px 0 6px 0; padding-left: 22px; }
li { margin: 3px 0; }
strong { color: #14331f; }
em { color: #555; }
hr { border: none; border-top: 1px solid #d9d9d9; margin: 20px 0; }
table {
  border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9.5pt;
  page-break-inside: avoid;
}
th, td { border: 1px solid #c9d6cd; padding: 5px 8px; text-align: left; vertical-align: top; }
th { background: #eaf3ed; color: #14331f; font-weight: 600; }
tr:nth-child(even) td { background: #f7faf8; }
code {
  font-family: Consolas, "Courier New", monospace; font-size: 9pt;
  background: #f0f2f1; padding: 1px 4px; border-radius: 3px;
}
pre { background: #f5f7f6; border: 1px solid #e0e5e2; border-radius: 4px; padding: 10px; overflow-x: auto; page-break-inside: avoid; }
pre code { background: none; padding: 0; }
blockquote { border-left: 4px solid #2f7d4f; margin: 10px 0; padding: 4px 14px; background: #f4f9f5; color: #333; }
/* Table of contents */
.toc { background: #f7faf8; border: 1px solid #d6e5db; border-radius: 6px; padding: 10px 18px; margin: 8px 0 4px; }
.toc ul { list-style: none; padding-left: 14px; margin: 2px 0; }
.toc > ul { padding-left: 0; }
.toc li { margin: 2px 0; font-size: 9.5pt; }
.toc a { color: #1f5132; text-decoration: none; }
a { color: #1f5132; }
"""

doc = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Uncle May's Produce - Strategy Review 2026-06-07</title>
<style>{CSS}</style></head>
<body>
{html_body}
</body></html>"""

open(HTML, "w", encoding="utf-8").write(doc)
print("Wrote HTML:", HTML)
print("HTML bytes:", len(doc))
print("Tables:", doc.count("<table>"), "| H2 sections:", doc.count("<h2"))
