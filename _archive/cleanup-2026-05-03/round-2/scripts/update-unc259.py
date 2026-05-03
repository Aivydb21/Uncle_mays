#!/usr/bin/env python3
import json
import os
import urllib.request

PAPERCLIP_API_URL = os.environ["PAPERCLIP_API_URL"]
PAPERCLIP_API_KEY = os.environ["PAPERCLIP_API_KEY"]
PAPERCLIP_RUN_ID = os.environ["PAPERCLIP_RUN_ID"]

comment = """## Hyde Park Local Marketing Materials — Generated

Created 8 design candidates (4 flyers + 4 door hangers) for the Hyde Park campaign using Canva AI with our brand kit.

### Flyer Designs (8.5" x 11", 500 units)
1. [Option 1](https://www.canva.com/d/bZEjkEl0IcEBKnl)
2. [Option 2](https://www.canva.com/d/lTYH2qtKAoFOk8F)
3. [Option 3](https://www.canva.com/d/7G0z84IiYnZx7zz)
4. [Option 4](https://www.canva.com/d/Oe8hnpZWTdOeWSt)

### Door Hanger Designs (4.25" x 11" with tear-off, 1,000 units)
1. [Option 1](https://www.canva.com/d/LEtMwPYBlvu9UAS)
2. [Option 2](https://www.canva.com/d/eN7drGiHEivsuP8)
3. [Option 3](https://www.canva.com/d/6fHT9efISEMBeFy)
4. [Option 4](https://www.canva.com/d/FyfLzLBVnk0ELee)

**All requirements included:**
- NEIGHBOR20 promo code
- $30 First Box offer
- QR code to unclemays.com
- Hyde Park location
- Premium positioning, culturally relevant
- Door hanger tear-off coupon design

**Full brief:** `ad-exports/hyde-park-local-marketing-brief.md`

**Next:** Review designs, select 1 flyer + 1 door hanger. I'll finalize, resize door hanger to print specs (4.25x11), add QR codes, and export print-ready PDFs."""

payload = json.dumps({
    "status": "in_review",
    "comment": comment
}).encode("utf-8")

req = urllib.request.Request(
    f"{PAPERCLIP_API_URL}/api/issues/b989a12d-d38d-45c0-be72-23c41bdd202b",
    data=payload,
    headers={
        "Authorization": f"Bearer {PAPERCLIP_API_KEY}",
        "X-Paperclip-Run-Id": PAPERCLIP_RUN_ID,
        "Content-Type": "application/json",
    },
    method="PATCH",
)

resp = urllib.request.urlopen(req, timeout=30)
result = json.loads(resp.read())
print("Task updated to in_review")
print(f"Status: {result['status']}")
print(f"Identifier: {result['identifier']}")
