#!/usr/bin/env python3
"""
Enrich CRE & HNW contacts via Apollo bulk_match endpoint.
Processes in small batches to respect rate limits.
"""

import json, sys, time, urllib.request, urllib.error, os

config = json.load(open(os.path.expanduser("~/.claude/apollo-config.json")))
API_KEY = config["api_key"]
BASE_URL = config["base_url"]
OUTPUT_DIR = os.path.expanduser("~/Desktop/business/investor-outreach/pipeline/cre-hnw")

CONTACTS = [
    {"first_name": "Quintin", "last_name": "Primo", "organization_name": "Capri Investment Group", "domain": "capri.global"},
    {"first_name": "Robin", "last_name": "Zeigler", "organization_name": "MURAL Real Estate Partners", "domain": "muralrealestate.com"},
    {"first_name": "Amin", "last_name": "Irving", "organization_name": "Ginosko Development Company", "domain": "ginosko.com"},
    {"first_name": "Greg", "last_name": "Reaves", "organization_name": "Mosaic Development Partners", "domain": "mosaicdp.com"},
    {"first_name": "Leslie", "last_name": "Smallwood-Lewis", "organization_name": "Mosaic Development Partners", "domain": "mosaicdp.com"},
    {"first_name": "Bo", "last_name": "Menkiti", "organization_name": "Menkiti Group", "domain": "menkitigroup.com"},
    {"first_name": "Christopher", "last_name": "Bramwell", "organization_name": "CB Emmanuel Realty"},
    {"first_name": "Victor", "last_name": "MacFarlane", "organization_name": "MacFarlane Partners"},
    {"first_name": "Tammy", "last_name": "Jones", "organization_name": "Basis Investment Group"},
    {"first_name": "Devon", "last_name": "Prioleau", "organization_name": "PDG"},
    {"first_name": "Kirk", "last_name": "Goodrich", "organization_name": "Monadnock Development", "domain": "monadnockdev.com"},
    {"first_name": "Daryl", "last_name": "Carter", "organization_name": "Avanath Capital", "domain": "avanath.com"},
    {"first_name": "Kimberly", "last_name": "Hardy", "organization_name": "McKissack", "domain": "mckissack.com"},
    {"first_name": "Ashley", "last_name": "Thomas", "organization_name": "NAREB", "domain": "nareb.com"},
    {"first_name": "John", "last_name": "Rogers", "organization_name": "Ariel Investments", "domain": "arielinvestments.com"},
    {"first_name": "Mellody", "last_name": "Hobson", "organization_name": "Ariel Investments", "domain": "arielinvestments.com"},
    {"first_name": "Jim", "last_name": "Reynolds", "organization_name": "Loop Capital", "domain": "loopcapital.com"},
    {"first_name": "Martin", "last_name": "Nesbitt", "organization_name": "Vistria Group", "domain": "vistria.com"},
    {"first_name": "Robert", "last_name": "Smith", "organization_name": "Vista Equity Partners", "domain": "vistaequitypartners.com"},
    {"first_name": "Bernard", "last_name": "Loyd", "organization_name": "Mesirow", "domain": "mesirow.com"},
    {"first_name": "Desiree", "last_name": "Rogers"},
    {"first_name": "Kimberly", "last_name": "Dowdell"},
    {"first_name": "Michael", "last_name": "Russell", "organization_name": "H.J. Russell"},
    {"first_name": "Benathan", "last_name": "Upshaw", "organization_name": "CB Emmanuel Realty"},
    {"first_name": "Jemal", "last_name": "King"},
    {"first_name": "Morgan", "last_name": "Malone"},
    {"first_name": "Emmitt", "last_name": "Smith"},
    {"first_name": "Leonard", "last_name": "Allen-Smith", "organization_name": "Allen Smith Equities"},
    {"first_name": "Valerie", "last_name": "Jarrett"},
]

KNOWN = [
    {"name": "Don Peebles", "email": "donpeebles@peeblescorp.com", "email_status": "verified", "org": "The Peebles Corporation", "title": "Owner & Founder", "city": "Miami", "state": "Florida"},
    {"name": "Leon Walker", "email": "lwalker@dl3realty.com", "email_status": "verified", "org": "DL3 Realty", "title": "Managing Partner", "city": "Chicago", "state": "Illinois"},
    {"name": "Jair Lynch", "email": "jlynch@cubesmart.com", "email_status": "verified", "org": "Jair Lynch Real Estate Partners", "title": "President/CEO", "city": "Washington", "state": "District of Columbia"},
]

BATCH_SIZE = 3  # small batches to avoid rate limits


def bulk_match(details):
    payload = json.dumps({"details": details}).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/people/bulk_match",
        data=payload,
        headers={"X-Api-Key": API_KEY, "User-Agent": "curl/8.0", "Content-Type": "application/json"},
        method="POST"
    )
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())


def main():
    results = list(KNOWN)
    no_email = []
    errors = []

    print(f"Enriching {len(CONTACTS)} contacts via bulk_match (+ {len(KNOWN)} known)")
    print("=" * 90)

    for i in range(0, len(CONTACTS), BATCH_SIZE):
        batch = CONTACTS[i:i + BATCH_SIZE]
        batch_names = [f"{c['first_name']} {c['last_name']}" for c in batch]

        if i > 0:
            time.sleep(5)

        retries = 0
        while retries < 3:
            try:
                resp = bulk_match(batch)
                matches = resp.get("matches", [])
                credits = resp.get("credits_consumed", 0)

                for j, m in enumerate(matches):
                    name = batch_names[j] if j < len(batch_names) else "?"
                    if m:
                        em = m.get("email", "")
                        status = m.get("email_status", "")
                        title = m.get("title", "")
                        org = m.get("organization", {}).get("name", "") if m.get("organization") else ""
                        city = m.get("city", "")
                        state = m.get("state", "")
                        linkedin = m.get("linkedin_url", "")
                        tag = "OK" if em else "NO-EM"
                        print(f"[{tag:5s}] {m.get('name', name):30s} | {em or 'N/A':35s} | {status:10s} | {org[:25]:25s} | {city}")
                        if em:
                            results.append({
                                "id": m.get("id", ""),
                                "name": m.get("name", name),
                                "email": em,
                                "email_status": status,
                                "title": title,
                                "org": org,
                                "city": city,
                                "state": state,
                                "linkedin": linkedin,
                            })
                        else:
                            no_email.append({"name": name, "org": batch[j].get("organization_name", ""), "id": m.get("id")})
                    else:
                        print(f"[NONE ] {name:30s} | Not found in Apollo")
                        errors.append({"name": name, "org": batch[j].get("organization_name", ""), "error": "not_found"})

                print(f"  [batch {i//BATCH_SIZE + 1}: {credits} credits consumed]")
                break

            except urllib.error.HTTPError as e:
                retries += 1
                wait = 10 * retries
                body = e.read().decode("utf-8", errors="replace")[:200]
                print(f"[WAIT ] Batch {i//BATCH_SIZE + 1}: HTTP {e.code}, retry {retries}/3 in {wait}s ({body})")
                if retries >= 3:
                    for name in batch_names:
                        errors.append({"name": name, "error": f"HTTP {e.code}"})
                    break
                time.sleep(wait)
            except Exception as e:
                print(f"[ERR  ] Batch {i//BATCH_SIZE + 1}: {e}")
                for name in batch_names:
                    errors.append({"name": name, "error": str(e)})
                break

    # Save results
    out_path = os.path.join(OUTPUT_DIR, "enrichment-results.json")
    with open(out_path, "w") as f:
        json.dump({"with_email": results, "no_email": no_email, "errors": errors}, f, indent=2)

    contacts_with_email = [
        {"id": r.get("id", ""), "name": r["name"], "email": r["email"],
         "email_status": r.get("email_status", ""), "org": r.get("org", ""),
         "title": r.get("title", "")}
        for r in results if r.get("email")
    ]
    with open(os.path.join(OUTPUT_DIR, "contacts-with-email.json"), "w") as f:
        json.dump(contacts_with_email, f, indent=2)

    print(f"\n{'=' * 90}")
    print(f"Total: {len(CONTACTS) + len(KNOWN)} | With email: {len(contacts_with_email)} | No email: {len(no_email)} | Errors: {len(errors)}")
    print(f"Results saved to: {out_path}")


if __name__ == "__main__":
    main()
