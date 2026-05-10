"""Quick website performance pull: 2026-04-17 (paid launch) -> 2026-05-07."""
import json, os, sys, time, base64, urllib.request, urllib.parse, urllib.error
from pathlib import Path

HOME = Path.home()
START = "2026-04-17"
END   = "2026-05-07"

def read_json(p):
    return json.loads(Path(p).read_text())

def http(method, url, headers=None, data=None, timeout=60):
    if isinstance(data, (dict, list)):
        data = json.dumps(data).encode()
        headers = {**(headers or {}), "Content-Type": "application/json"}
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return 0, str(e)

# ---------- GA4 ----------
def ga4():
    cfg = read_json(HOME / ".claude/ga-config.json")
    pid = cfg.get("property_id") or cfg.get("propertyId") or cfg.get("ga_property_id")
    pid = str(pid).replace("properties/", "")
    # service account JWT
    from datetime import datetime, timedelta
    import hmac, hashlib
    sa = read_json(HOME / ".claude/ga-service-account.json")
    now = int(time.time())
    header = base64.urlsafe_b64encode(json.dumps({"alg":"RS256","typ":"JWT"}).encode()).rstrip(b"=")
    claim = base64.urlsafe_b64encode(json.dumps({
        "iss": sa["client_email"],
        "scope": "https://www.googleapis.com/auth/analytics.readonly",
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now, "exp": now+3600,
    }).encode()).rstrip(b"=")
    signing_input = header + b"." + claim
    # need RSA — use cryptography
    try:
        from cryptography.hazmat.primitives import serialization, hashes
        from cryptography.hazmat.primitives.asymmetric import padding
    except ImportError:
        return {"error":"missing cryptography lib"}
    key = serialization.load_pem_private_key(sa["private_key"].encode(), password=None)
    sig = key.sign(signing_input, padding.PKCS1v15(), hashes.SHA256())
    jwt = signing_input + b"." + base64.urlsafe_b64encode(sig).rstrip(b"=")
    code, body = http("POST", "https://oauth2.googleapis.com/token",
        headers={"Content-Type":"application/x-www-form-urlencoded"},
        data=urllib.parse.urlencode({"grant_type":"urn:ietf:params:oauth:grant-type:jwt-bearer","assertion":jwt.decode()}).encode())
    if code != 200:
        return {"error":f"ga4 token {code}: {body[:200]}"}
    tok = json.loads(body)["access_token"]
    out = {}
    # totals
    code, body = http("POST", f"https://analyticsdata.googleapis.com/v1beta/properties/{pid}:runReport",
        headers={"Authorization":f"Bearer {tok}"},
        data={"dateRanges":[{"startDate":START,"endDate":END}],
              "metrics":[{"name":"sessions"},{"name":"totalUsers"},{"name":"screenPageViews"},
                         {"name":"engagementRate"},{"name":"averageSessionDuration"}]})
    out["totals_raw"] = body[:600] if code != 200 else json.loads(body)
    # traffic sources
    code, body = http("POST", f"https://analyticsdata.googleapis.com/v1beta/properties/{pid}:runReport",
        headers={"Authorization":f"Bearer {tok}"},
        data={"dateRanges":[{"startDate":START,"endDate":END}],
              "dimensions":[{"name":"sessionDefaultChannelGroup"}],
              "metrics":[{"name":"sessions"},{"name":"totalUsers"}],
              "orderBys":[{"metric":{"metricName":"sessions"},"desc":True}],
              "limit":10})
    out["channels"] = body[:1500] if code != 200 else json.loads(body)
    # conversions / events
    code, body = http("POST", f"https://analyticsdata.googleapis.com/v1beta/properties/{pid}:runReport",
        headers={"Authorization":f"Bearer {tok}"},
        data={"dateRanges":[{"startDate":START,"endDate":END}],
              "dimensions":[{"name":"eventName"}],
              "metrics":[{"name":"eventCount"}],
              "dimensionFilter":{"filter":{"fieldName":"eventName","inListFilter":{"values":["begin_checkout","add_to_cart","purchase","view_item","page_view"]}}}})
    out["events"] = body[:1500] if code != 200 else json.loads(body)
    # top pages
    code, body = http("POST", f"https://analyticsdata.googleapis.com/v1beta/properties/{pid}:runReport",
        headers={"Authorization":f"Bearer {tok}"},
        data={"dateRanges":[{"startDate":START,"endDate":END}],
              "dimensions":[{"name":"pagePath"}],
              "metrics":[{"name":"screenPageViews"},{"name":"sessions"}],
              "orderBys":[{"metric":{"metricName":"screenPageViews"},"desc":True}],
              "limit":10})
    out["top_pages"] = body[:2000] if code != 200 else json.loads(body)
    return out

# ---------- Google Ads ----------
def google_ads():
    cfg = read_json(HOME / ".claude/google-ads-config.json")
    code, body = http("POST", "https://oauth2.googleapis.com/token",
        headers={"Content-Type":"application/x-www-form-urlencoded"},
        data=urllib.parse.urlencode({
            "client_id": cfg["client_id"], "client_secret": cfg["client_secret"],
            "refresh_token": cfg["refresh_token"], "grant_type":"refresh_token"}).encode())
    if code != 200: return {"error":f"gads token {code}: {body[:200]}"}
    tok = json.loads(body)["access_token"]
    cust = cfg.get("customer_id","6015592923")
    headers = {"Authorization":f"Bearer {tok}", "developer-token": cfg["developer_token"]}
    out = {}
    # account totals over window
    q = f"""SELECT metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions, metrics.conversions_value
            FROM customer
            WHERE segments.date BETWEEN '{START}' AND '{END}'"""
    code, body = http("POST", f"https://googleads.googleapis.com/v22/customers/{cust}/googleAds:search",
                      headers=headers, data={"query": q})
    if code != 200:
        # try v20
        code, body = http("POST", f"https://googleads.googleapis.com/v18/customers/{cust}/googleAds:search",
                          headers=headers, data={"query": q})
    out["totals"] = body[:2000] if code != 200 else json.loads(body)
    # per-campaign
    q2 = f"""SELECT campaign.id, campaign.name, campaign.status,
                    metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions
             FROM campaign
             WHERE segments.date BETWEEN '{START}' AND '{END}'
             ORDER BY metrics.cost_micros DESC"""
    code, body = http("POST", f"https://googleads.googleapis.com/v22/customers/{cust}/googleAds:search",
                      headers=headers, data={"query": q2})
    if code != 200:
        code, body = http("POST", f"https://googleads.googleapis.com/v18/customers/{cust}/googleAds:search",
                          headers=headers, data={"query": q2})
    out["campaigns"] = body[:5000] if code != 200 else json.loads(body)
    return out

# ---------- Meta ----------
def meta():
    cfg = read_json(HOME / ".claude/meta-config.json")
    tok = cfg.get("access_token") or cfg.get("token")
    acct = cfg.get("ad_account_id","act_814877604473301")
    if not acct.startswith("act_"): acct = f"act_{acct}"
    fields = "spend,impressions,clicks,ctr,cpc,actions,action_values"
    url = f"https://graph.facebook.com/v21.0/{acct}/insights?fields={fields}&time_range[since]={START}&time_range[until]={END}&access_token={tok}"
    code, body = http("GET", url)
    out = {"account_totals": body[:2000] if code != 200 else json.loads(body)}
    # per campaign
    url2 = f"https://graph.facebook.com/v21.0/{acct}/insights?fields={fields},campaign_name&level=campaign&time_range[since]={START}&time_range[until]={END}&access_token={tok}"
    code, body = http("GET", url2)
    out["campaigns"] = body[:5000] if code != 200 else json.loads(body)
    return out

# ---------- Stripe ----------
def stripe():
    cfg = read_json(HOME / ".claude/stripe-config.json")
    key = cfg.get("api_key") or cfg.get("secret_key")
    auth = base64.b64encode(f"{key}:".encode()).decode()
    headers = {"Authorization": f"Basic {auth}"}
    import datetime as dt
    s = int(dt.datetime.fromisoformat(START).timestamp())
    e = int((dt.datetime.fromisoformat(END) + dt.timedelta(days=1)).timestamp())
    out = {"charges":[]}
    url = f"https://api.stripe.com/v1/charges?created[gte]={s}&created[lt]={e}&limit=100"
    while url:
        code, body = http("GET", url, headers=headers)
        if code != 200:
            out["error"] = body[:300]; break
        d = json.loads(body)
        out["charges"].extend(d.get("data", []))
        if d.get("has_more"):
            last = d["data"][-1]["id"]
            url = f"https://api.stripe.com/v1/charges?created[gte]={s}&created[lt]={e}&limit=100&starting_after={last}"
        else:
            url = None
    succ = [c for c in out["charges"] if c.get("status")=="succeeded" and not c.get("refunded")]
    out["summary"] = {
        "succeeded_count": len(succ),
        "succeeded_amount_usd": sum(c["amount"] for c in succ)/100,
        "total_charges": len(out["charges"]),
    }
    out.pop("charges", None)
    return out

if __name__ == "__main__":
    result = {"window": f"{START} to {END}"}
    for name, fn in [("ga4", ga4), ("google_ads", google_ads), ("meta", meta), ("stripe", stripe)]:
        try:
            result[name] = fn()
        except Exception as e:
            result[name] = {"error": f"{type(e).__name__}: {e}"}
    print(json.dumps(result, indent=2, default=str))
