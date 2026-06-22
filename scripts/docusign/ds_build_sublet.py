#!/usr/bin/env python3
"""
Build the 3304 sublet e-signature envelope in DocuSign (demo).

  py -3 ds_build_sublet.py --preview         # render annotated PNGs to verify placement
  py -3 ds_build_sublet.py --create          # create as DRAFT (status=created), no emails sent
  py -3 ds_build_sublet.py --create --send   # create AND send (demo = watermarked)

Field positions are absolute (points from top-left), derived from probe_layout.py.
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ds_token import load_config, get_token  # noqa: E402

PDF = os.path.expanduser("~/Downloads/3304 - sublet agreement - 2026.PDF")

# key -> (name, email, recipientId, routingOrder)
PEOPLE = {
    "T1": ("Atharwa Rajesh Sheth", "shethatharwa@gmail.com", "1", "1"),
    "T2": ("Mayur Vikas Joshi", "mjoshi0@chicagobooth.edu", "2", "1"),
    "T3": ("Varun Sanklecha", "vsanklec@chicagobooth.edu", "3", "1"),
    "S1": ("Anthony Ivy", "aivy0@alumni.chicagobooth.edu", "4", "1"),
    "S2": ("Kayoung Kim", "kayoung715@gmail.com", "5", "1"),
    "S3": ("Jay Goenka", "jaygoenka.15@gmail.com", "6", "1"),
    "L": ("Millennium Park Living, Inc. (Mike Overmier)", "MOvermier@millenniumparkplaza.com", "7", "2"),
}

# (who, kind, page, x, y)   kind: sign | date | initial | name | text
TABS = [
    # Safe Homes p1-4 (names are labels below the signature line)
    ("S1", "sign", 1, 65, 606), ("S1", "date", 1, 228, 608),
    ("S2", "sign", 1, 317, 606), ("S2", "date", 1, 479, 608),
    ("S3", "sign", 1, 65, 643), ("S3", "date", 1, 228, 645),
    ("S1", "sign", 2, 65, 611), ("S1", "date", 2, 228, 613),
    ("S2", "sign", 2, 317, 611), ("S2", "date", 2, 479, 613),
    ("S3", "sign", 2, 65, 648), ("S3", "date", 2, 228, 650),
    ("S1", "sign", 3, 65, 566), ("S1", "date", 3, 228, 568),
    ("S2", "sign", 3, 317, 566), ("S2", "date", 3, 479, 568),
    ("S3", "sign", 3, 65, 603), ("S3", "date", 3, 228, 605),
    ("S1", "sign", 4, 65, 607), ("S1", "date", 4, 228, 609),
    ("S2", "sign", 4, 317, 607), ("S2", "date", 4, 479, 609),
    ("S3", "sign", 4, 65, 644), ("S3", "date", 4, 228, 646),
    # Sublet Agreement p5 (By: lines)
    ("T1", "sign", 5, 90, 590), ("S1", "sign", 5, 242, 590),
    ("T2", "sign", 5, 90, 619), ("S2", "sign", 5, 242, 619),
    ("T3", "sign", 5, 90, 647), ("S3", "sign", 5, 242, 647),
    ("L", "sign", 5, 460, 675),
    # Life Safety Disclosure p6
    ("L", "text", 6, 82, 338),
    ("L", "sign", 6, 82, 405), ("L", "date", 6, 372, 407),
    ("S1", "sign", 6, 82, 532), ("S1", "date", 6, 372, 534),
    ("S2", "sign", 6, 82, 598), ("S2", "date", 6, 381, 600),
    ("S3", "sign", 6, 82, 664), ("S3", "date", 6, 381, 666),
    # Lead-Based Paint Disclosure p8
    ("S1", "initial", 8, 88, 414), ("S1", "initial", 8, 88, 428),
    ("L", "initial", 8, 88, 470),
    ("S1", "sign", 8, 134, 577), ("S1", "name", 8, 134, 592),
    ("S2", "sign", 8, 134, 615), ("S2", "name", 8, 134, 630),
    ("S3", "sign", 8, 134, 654), ("S3", "name", 8, 134, 669),
    ("L", "sign", 8, 358, 628),
    # Non-Conforming Occupancy Rider p9 (By: + Print:)
    ("T1", "sign", 9, 66, 530), ("T1", "name", 9, 66, 548),
    ("T2", "sign", 9, 66, 572), ("T2", "name", 9, 66, 590),
    ("T3", "sign", 9, 66, 615), ("T3", "name", 9, 66, 633),
    ("S1", "sign", 9, 252, 530), ("S1", "name", 9, 252, 548),
    ("S2", "sign", 9, 252, 572), ("S2", "name", 9, 252, 590),
    ("S3", "sign", 9, 252, 615), ("S3", "name", 9, 252, 633),
    ("L", "sign", 9, 437, 629),
    # Internet Service Agreement signature p13 (names below lines)
    ("S1", "sign", 13, 18, 131), ("S1", "date", 13, 213, 133),
    ("S2", "sign", 13, 315, 131), ("S2", "date", 13, 510, 133),
    ("S3", "sign", 13, 18, 177), ("S3", "date", 13, 213, 179),
    ("L", "sign", 13, 315, 300), ("L", "date", 13, 510, 300),
    # RLTO Acknowledged p21 (unlabeled)
    ("S1", "sign", 21, 65, 155), ("S1", "date", 21, 213, 157),
    ("S2", "sign", 21, 65, 201), ("S2", "date", 21, 213, 203),
    ("S3", "sign", 21, 65, 251), ("S3", "date", 21, 213, 253),
    ("L", "sign", 21, 335, 345), ("L", "date", 21, 510, 349),
    # Smoke/CO Detector Disclosure p24 (unlabeled)
    ("S1", "sign", 24, 65, 369), ("S1", "date", 24, 213, 371),
    ("S2", "sign", 24, 65, 415), ("S2", "date", 24, 213, 417),
    ("S3", "sign", 24, 65, 464), ("S3", "date", 24, 213, 466),
    ("L", "sign", 24, 335, 559), ("L", "date", 24, 510, 563),
]

# approximate rendered sizes (w,h) for preview boxes
SIZE = {"sign": (105, 22), "date": (62, 16), "initial": (32, 20),
        "name": (105, 16), "text": (150, 16)}
COLOR = {"T1": (0.85, 0.1, 0.1), "T2": (0.85, 0.4, 0.1), "T3": (0.85, 0.6, 0.1),
         "S1": (0.1, 0.3, 0.85), "S2": (0.1, 0.55, 0.75), "S3": (0.2, 0.6, 0.2),
         "L": (0.5, 0.1, 0.6)}


def build_signer_tabs(who):
    sign, date, init, name, text = [], [], [], [], []
    for w, kind, page, x, y in TABS:
        if w != who:
            continue
        base = {"documentId": "1", "pageNumber": str(page),
                "xPosition": str(x), "yPosition": str(y)}
        if kind == "sign":
            sign.append(base)
        elif kind == "date":
            date.append(base)
        elif kind == "initial":
            init.append(base)
        elif kind == "name":
            name.append(base)
        elif kind == "text":
            text.append({**base, "tabLabel": "discloser_name_title",
                         "width": "200", "height": "14"})
    tabs = {}
    if sign:
        tabs["signHereTabs"] = sign
    if date:
        tabs["dateSignedTabs"] = date
    if init:
        tabs["initialHereTabs"] = init
    if name:
        tabs["fullNameTabs"] = name
    if text:
        tabs["textTabs"] = text
    return tabs


def envelope_definition(status):
    with open(PDF, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    signers = []
    for key, (name, email, rid, ro) in PEOPLE.items():
        signers.append({
            "email": email, "name": name, "recipientId": rid,
            "routingOrder": ro, "tabs": build_signer_tabs(key),
        })
    return {
        "emailSubject": "Sublet Agreement - 151 N. Michigan Ave #3304",
        "documents": [{"documentBase64": b64, "name": "3304 Sublet Agreement",
                       "fileExtension": "pdf", "documentId": "1"}],
        "recipients": {"signers": signers},
        "status": status,
    }


def create(send):
    cfg = load_config()
    token = get_token(cfg)
    status = "sent" if send else "created"
    url = f"{cfg['base_uri']}/v2.1/accounts/{cfg['account_id']}/envelopes"
    body = json.dumps(envelope_definition(status)).encode()
    req = urllib.request.Request(url, data=body, headers={
        "Authorization": f"Bearer {token}", "Content-Type": "application/json",
        "User-Agent": "curl/8.0"})
    try:
        with urllib.request.urlopen(req) as resp:
            out = json.load(resp)
    except urllib.error.HTTPError as e:
        sys.exit(f"Create failed ({e.code}): {e.read().decode()}")
    print(json.dumps(out, indent=2))
    eid = out.get("envelopeId")
    if eid:
        ui = "https://apps-d.docusign.com/send/documents/details/" + eid
        print(f"\nStatus: {out.get('status')}\nEnvelope: {eid}\nReview/send: {ui}")


def preview(pages):
    import fitz
    outdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview")
    os.makedirs(outdir, exist_ok=True)
    doc = fitz.open(PDF)
    want = set(pages) if pages else {t[2] for t in TABS}
    zoom = 2.0
    for page1 in sorted(want):
        page = doc[page1 - 1]
        for w, kind, p, x, y in TABS:
            if p != page1:
                continue
            ww, hh = SIZE[kind]
            rect = fitz.Rect(x, y, x + ww, y + hh)
            page.draw_rect(rect, color=COLOR[w], width=1.2)
            page.insert_text((x, y - 1), w, fontsize=6, color=COLOR[w])
        pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
        path = os.path.join(outdir, f"page_{page1:02d}.png")
        pix.save(path)
        print(path)


if __name__ == "__main__":
    if "--preview" in sys.argv:
        nums = [int(a) for a in sys.argv if a.isdigit()]
        preview(nums)
    elif "--create" in sys.argv:
        create("--send" in sys.argv)
    else:
        print(__doc__)
