#!/usr/bin/env python3
"""
Batch enrich CRE & HNW contacts via Apollo people/match.
Handles rate limits with exponential backoff.

Usage: python3 scripts/enrich-cre-batch.py
"""

import json, sys, time, urllib.request, urllib.error, os

config = json.load(open(os.path.expanduser("~/.claude/apollo-config.json")))
API_KEY = config["api_key"]
BASE_URL = config["base_url"]

OUTPUT_DIR = os.path.expanduser("~/Desktop/business/investor-outreach/pipeline/cre-hnw")

CONTACTS = [
    ("Quintin", "Primo", "Capri Investment Group", "capri.global"),
    ("Jair", "Lynch", "Jair Lynch Real Estate Partners", "jairlynch.com"),
    ("Robin", "Zeigler", "MURAL Real Estate Partners", "muralrealestate.com"),
    ("Amin", "Irving", "Ginosko Development Company", "ginosko.com"),
    ("Greg", "Reaves", "Mosaic Development Partners", "mosaicdp.com"),
    ("Leslie", "Smallwood-Lewis", "Mosaic Development Partners", "mosaicdp.com"),
    ("Bo", "Menkiti", "Menkiti Group", "menkitigroup.com"),
    ("Christopher", "Bramwell", "CB Emmanuel Realty", None),
    ("Victor", "MacFarlane", "MacFarlane Partners", None),
    ("Tammy", "Jones", "Basis Investment Group", None),
    ("Devon", "Prioleau", "PDG", None),
    ("Kirk", "Goodrich", "Monadnock Development", "monadnockdev.com"),
    ("Daryl", "Carter", "Avanath Capital", "avanath.com"),
    ("Kimberly", "Hardy", "McKissack", "mckissack.com"),
    ("Ashley", "Thomas", "NAREB", "nareb.com"),
    ("John", "Rogers", "Ariel Investments", "arielinvestments.com"),
    ("Mellody", "Hobson", "Ariel Investments", "arielinvestments.com"),
    ("Jim", "Reynolds", "Loop Capital", "loopcapital.com"),
    ("Martin", "Nesbitt", "Vistria Group", "vistria.com"),
    ("Robert", "Smith", "Vista Equity Partners", "vistaequitypartners.com"),
    ("Bernard", "Loyd", "Mesirow", "mesirow.com"),
    ("Desiree", "Rogers", None, None),
    ("Kimberly", "Dowdell", None, None),
    ("Michael", "Russell", "H.J. Russell", None),
    ("Benathan", "Upshaw", "CB Emmanuel Realty", None),
    ("Jemal", "King", None, None),
    ("Morgan", "Malone", None, None),
    ("Emmitt", "Smith", None, None),
    ("Leonard", "Allen-Smith", "Allen Smith Equities", None),
    ("Valerie", "Jarrett", None, None),
]

KNOWN = {
    "Don Peebles": {"name": "Don Peebles", "email": "donpeebles@peeblescorp.com", "org": "The Peebles Corporation", "title": "Owner & Founder", "city": "Miami", "state": "Florida"},
    "Leon Walker": {"name": "Leon Walker", "email": "lwalker@dl3realty.com", "org": "DL3 Realty", "title": "Managing Partner", "city": "Chicago", "state": "Illinois"},
}


def apollo_match(first_name, last_name, org_name=None, domain=None):
    payload = {"first_name": first_name, "last_name": last_name}
    if org_name:
        payload["organization_name"] = org_name
    if domain:
        payload["domain"] = domain
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/people/match", data=data,
        headers={"X-Api-Key": API_KEY, "User-Agent": "curl/8.0", "Content-Type": "application/json"},
        method="POST"
    )
    resp = urllib.request.urlopen(req, timeout=20)
    result = json.loads(resp.read())
    p = result.get("person")
    if p:
        return {
            "id": p.get("id"),
            "name": p.get("name", ""),
            "email": p.get("email"),
            "email_status": p.get("email_status", ""),
            "title": p.get("title", ""),
            "org": p.get("organization", {}).get("name", "") if p.get("organization") else "",
            "city": p.get("city", ""),
            "state": p.get("state", ""),
            "linkedin": p.get("linkedin_url", ""),
        }
    return None


def main():
    results = list(KNOWN.values())
    no_email = []
    errors = []
    delay = 3  # start with 3s between calls

    print(f"Enriching {len(CONTACTS)} contacts (+ {len(KNOWN)} known)")
    print("=" * 80)

    for i, (first, last, org, domain) in enumerate(CONTACTS):
        name = f"{first} {last}"

        if i > 0:
            time.sleep(delay)

        retries = 0
        while retries < 3:
            try:
                r = apollo_match(first, last, org, domain)
                if r:
                    em = r.get("email", "")
                    status = r.get("email_status", "")
                    loc = f"{r.get('city','')}, {r.get('state','')}" if r.get('city') else "?"
                    tag = "OK" if em else "NO-EM"
                    print(f"[{tag:5s}] {r['name']:30s} | {em or 'N/A':35s} | {status:10s} | {r.get('org','')[:25]:25s} | {loc}")
                    if em:
                        results.append(r)
                    else:
                        no_email.append({"name": name, "org": org or "", "id": r.get("id")})
                else:
                    print(f"[NONE ] {name:30s} | Not found in Apollo")
                    errors.append({"name": name, "org": org or "", "error": "not_found"})
                break  # success, move to next contact

            except urllib.error.HTTPError as e:
                if e.code == 403 or e.code == 429:
                    retries += 1
                    wait = delay * (2 ** retries)
                    print(f"[WAIT ] {name}: HTTP {e.code}, retrying in {wait}s ({retries}/3)")
                    time.sleep(wait)
                    delay = min(delay + 2, 15)  # slow down
                else:
                    print(f"[ERR  ] {name}: HTTP {e.code}")
                    errors.append({"name": name, "org": org or "", "error": f"HTTP {e.code}"})
                    break
            except Exception as e:
                print(f"[ERR  ] {name}: {e}")
                errors.append({"name": name, "org": org or "", "error": str(e)})
                break

    # Save results
    output = {"with_email": results, "no_email": no_email, "errors": errors}
    out_path = os.path.join(OUTPUT_DIR, "enrichment-results.json")
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    # Save contact list for campaign creation
    contacts_with_email = [
        {"id": r.get("id", ""), "name": r["name"], "email": r["email"],
         "org": r.get("org", ""), "title": r.get("title", "")}
        for r in results if r.get("email")
    ]
    with open(os.path.join(OUTPUT_DIR, "contacts-with-email.json"), "w") as f:
        json.dump(contacts_with_email, f, indent=2)

    print(f"\n{'=' * 80}")
    print(f"Total: {len(CONTACTS) + len(KNOWN)} | With email: {len(contacts_with_email)} | No email: {len(no_email)} | Errors: {len(errors)}")
    print(f"Saved to: {out_path}")


if __name__ == "__main__":
    main()
