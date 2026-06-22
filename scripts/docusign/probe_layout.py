"""Probe the sublet PDF: print page sizes and the coordinates of every label
that anchors a signature, initial, or date field. 0-based page indices."""
import os
import fitz  # PyMuPDF

PDF = os.path.expanduser("~/Downloads/3304 - sublet agreement - 2026.PDF")

TERMS = [
    "ANTHONY IVY", "KAYOUNG KIM", "JAY GOENKA",
    "ATHARWA RAJESH", "MAYUR VIKAS JOSHI", "VARUN SANKLECHA",
    "Millennium Park",
    "Sub-Tenant:", "Tenant:", "Landlord:",
    "By:", "Print:", "Date",
    "Agent for Owner",
    "Signature of Tenant Receiving Disclosure",
    "Name of Person Making Disclosure",
    "Signature of Person Making Disclosure",
    "Lessee has received",
    "Agent has informed",
    "ACKNOWLEDGED, UNDERSTOOD",
]

doc = fitz.open(PDF)
print(f"pages={doc.page_count}")
for i in range(doc.page_count):
    page = doc[i]
    r = page.rect
    hits = []
    for t in TERMS:
        for rect in page.search_for(t):
            hits.append((round(rect.x0), round(rect.y0), round(rect.x1), round(rect.y1), t))
    if not hits:
        continue
    hits.sort(key=lambda h: (h[1], h[0]))  # top-to-bottom, left-to-right
    print(f"\n=== page idx {i}  size {round(r.width)}x{round(r.height)} ===")
    for x0, y0, x1, y1, t in hits:
        print(f"  ({x0:>4},{y0:>4})-({x1:>4},{y1:>4})  {t}")
