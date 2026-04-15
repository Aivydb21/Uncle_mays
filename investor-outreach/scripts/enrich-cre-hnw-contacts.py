#!/usr/bin/env python3
"""
Enrich CRE & HNW contacts via Apollo people/match endpoint.
Run this when Apollo API quota resets.

Usage:
    python3 scripts/enrich-cre-hnw-contacts.py          # dry run
    python3 scripts/enrich-cre-hnw-contacts.py --execute # actually call API + create contacts
"""

import json, sys, time, urllib.request, urllib.error, os, re

config = json.load(open(os.path.expanduser("~/.claude/apollo-config.json")))
API_KEY = config["api_key"]
BASE_URL = config["base_url"]
EXECUTE = "--execute" in sys.argv

OUTPUT_DIR = os.path.join(os.path.expanduser("~/Desktop/business/investor-outreach/pipeline/cre-hnw"))

def apollo_match(first_name, last_name, org_name=None, domain=None):
    """Look up a person via Apollo people/match endpoint."""
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
    try:
        resp = urllib.request.urlopen(req, timeout=15)
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
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}"}
    except Exception as e:
        return {"error": str(e)}
    return None


def apollo_create_contact(first_name, last_name, email, org_name=None, title=None):
    """Create a contact in Apollo database."""
    payload = {"first_name": first_name, "last_name": last_name, "email": email}
    if org_name:
        payload["organization_name"] = org_name
    if title:
        payload["title"] = title
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/contacts", data=data,
        headers={"X-Api-Key": API_KEY, "User-Agent": "curl/8.0", "Content-Type": "application/json"},
        method="POST"
    )
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        result = json.loads(resp.read())
        c = result.get("contact", {})
        return {"id": c.get("id"), "email": c.get("email")}
    except urllib.error.HTTPError as e:
        return {"error": f"HTTP {e.code}"}
    except Exception as e:
        return {"error": str(e)}


# Contacts to enrich (name, org, domain)
CONTACTS = [
    ("Don", "Peebles", "Peebles Corporation", "peeblescorp.com"),
    ("Quintin", "Primo", "Capri Investment Group", "capri.global"),
    ("Leon", "Walker", "DL3 Realty", "dl3realty.com"),
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

# Already verified from earlier test calls
KNOWN_EMAILS = {
    "Don Peebles": "donpeebles@peeblescorp.com",
    "Leon Walker": "lwalker@dl3realty.com",
}


def main():
    results = []
    no_email = []
    errors = []

    print(f"{'DRY RUN' if not EXECUTE else 'EXECUTING'}: Enriching {len(CONTACTS)} contacts")
    print("=" * 70)

    for i, (first, last, org, domain) in enumerate(CONTACTS):
        name = f"{first} {last}"

        # Skip if we already have the email
        if name in KNOWN_EMAILS:
            print(f"[KNOWN] {name:30s} | {KNOWN_EMAILS[name]}")
            results.append({
                "name": name, "email": KNOWN_EMAILS[name],
                "org": org or "", "title": "", "city": "", "state": ""
            })
            continue

        if not EXECUTE:
            print(f"[SKIP ] {name:30s} | Would call people/match (dry run)")
            continue

        # Rate limit: 1 call every 20 seconds to stay well under limits
        if i > 0:
            time.sleep(20)

        r = apollo_match(first, last, org, domain)
        if r and not r.get("error"):
            em = r.get("email", "")
            tag = "EMAIL" if em else "no-em"
            loc = f"{r.get('city','')}, {r.get('state','')}" if r.get('city') else "?"
            print(f"[{tag:5s}] {r['name']:30s} | {r.get('email',''):35s} | {r.get('org','')[:25]:25s} | {loc}")
            if em:
                results.append(r)
            else:
                no_email.append(r)
        elif r and r.get("error"):
            print(f"[ERR  ] {name}: {r['error']}")
            errors.append({"name": name, "org": org or "", "error": r["error"]})
            if "403" in r["error"]:
                print("!!! HTTP 403 (often Cloudflare UA block, not Apollo rate limit). Stopping. Verify the User-Agent header is set on the request and retry. If the UA is set, this is a real Apollo quota limit, re-run when quota resets.")
                break
        else:
            print(f"[NONE ] {name}: Not found in Apollo")
            errors.append({"name": name, "org": org or "", "error": "not_found"})

    # Save results
    output = {"with_email": results, "no_email": no_email, "errors": errors}
    with open(os.path.join(OUTPUT_DIR, "research-raw.json"), "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n{'=' * 70}")
    print(f"Total: {len(CONTACTS)} | With email: {len(results)} | No email: {len(no_email)} | Errors: {len(errors)}")

    if results:
        # Save contact IDs for campaign creation
        contact_ids = [{"id": r.get("id",""), "name": r["name"], "email": r["email"], "org": r.get("org","")} for r in results if r.get("email")]
        with open(os.path.join(OUTPUT_DIR, "contacts-with-email.json"), "w") as f:
            json.dump(contact_ids, f, indent=2)
        print(f"Saved {len(contact_ids)} contacts with email to contacts-with-email.json")


if __name__ == "__main__":
    main()
